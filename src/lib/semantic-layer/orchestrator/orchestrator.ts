/**
 * Prompt Chain Orchestrator — Task 4 + 4.1
 *
 * Implements the four-step pipeline: Parse → Map → Generate → Validate.
 * Each step:
 *   1. Hashes its input for idempotency/determinism (FR-4)
 *   2. Calls the LLM (or skips via idempotency guard)
 *   3. Persists the intermediate artifact to chain_traces (FR-3)
 *   4. Halts on failure with partial artifacts preserved (AC-PC-3)
 *
 * The orchestrator receives the Entrata schema catalog and injects it
 * into Steps 2, 3, and 4 so the agent grounds against real tables (FR-15).
 *
 * Requirements: FR-1..FR-4, FR-15, FR-16, AC-PC-1..AC-PC-3, AC-SC-1
 * Design ref:   design.md §2 (Prompt chain design)
 */

import * as scanRepo from '../repositories/scanRepository';
import * as catalogRepo from '../repositories/catalogRepository';
import * as entityRepo from '../repositories/entityRepository';
import * as measureRepo from '../repositories/measureRepository';
import { validateAll } from './validationRules';
import { sha256 } from './hashUtils';
import type { LlmClient, ExistingLayerSnapshot } from './llmClient';
import type {
  OrchestratorInput,
  OrchestratorResult,
  ParseStepOutput,
  MapStepOutput,
  GenerateStepOutput,
  ValidateStepOutput,
  ChainStepName,
  ChainTraceStatus,
  EntrataSchemaEntry,
} from '../types';

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Processes a single report's metric logic through the four-step
 * prompt chain. This is the core entry point for the agent.
 *
 * Flow:
 *   1. Idempotency guard (VR-8): skip if the input hash matches the
 *      last successful run for this report.
 *   2. Step 1 — Parse: decompose raw logic into an AST.
 *   3. Step 2 — Map: identify candidate entities/relationships/measures
 *      grounded against the Entrata schema catalog.
 *   4. Step 3 — Generate: merge candidates with the existing layer.
 *   5. Step 4 — Validate: run VR-1..VR-9 against the merged output.
 *   6. On validation pass: return success. (Commit is handled by the caller.)
 *      On failure at any step: halt, persist partial artifacts, return error.
 *
 * @param input     - Report logic and context
 * @param llmClient - LLM client implementation (real or mock)
 * @returns Result indicating success/failure, violations, and skip status
 */
export async function processReport(
  input: OrchestratorInput,
  llmClient: LlmClient
): Promise<OrchestratorResult> {
  const { tenantId, reportId, logic, logicType, scanRunId } = input;

  // ── Idempotency guard (VR-8, NFR-2) ────────────────────────────────
  // Compare the input hash against the last successful Step 1 trace
  // for this report. If unchanged, skip the entire chain.
  const inputHash = sha256({ logic, logicType });
  const lastTrace = await scanRepo.getLatestTraceForReport(reportId, 1);

  if (lastTrace && lastTrace.inputHash === inputHash && lastTrace.status === 'success') {
    // Record a skip trace for auditability
    await scanRepo.appendChainTrace({
      scanRunId,
      reportId,
      stepNumber: 1,
      stepName: 'parse',
      inputHash,
      output: { skipped: true, reason: 'VR-8 idempotency — input unchanged' },
      status: 'success',
      durationMs: 0,
    });

    return {
      scanRunId,
      reportId,
      success: true,
      failedAtStep: null,
      skipped: true,
      violations: [],
    };
  }

  // ── Load context ────────────────────────────────────────────────────
  // Fetch the Entrata schema catalog and existing layer snapshot.
  // These are injected into Steps 2, 3, and 4.
  const catalogEntries = await loadCatalogEntries();
  const existingLayer = await loadExistingLayer(tenantId);

  // ── Step 1 — Parse ─────────────────────────────────────────────────
  const parseResult = await executeStep<ParseStepOutput>({
    scanRunId,
    reportId,
    stepNumber: 1,
    stepName: 'parse',
    inputHash,
    execute: () => llmClient.parse(logic, logicType),
  });

  if (!parseResult.success) {
    return buildFailureResult(scanRunId, reportId, 'parse');
  }

  // ── Step 2 — Map ───────────────────────────────────────────────────
  const mapInputHash = sha256({
    parseOutput: parseResult.output,
    catalogTables: catalogEntries.map((e) => e.tableName),
  });

  const mapResult = await executeStep<MapStepOutput>({
    scanRunId,
    reportId,
    stepNumber: 2,
    stepName: 'map',
    inputHash: mapInputHash,
    execute: () => llmClient.map(parseResult.output!, catalogEntries),
  });

  if (!mapResult.success) {
    return buildFailureResult(scanRunId, reportId, 'map');
  }

  // ── Step 3 — Generate ──────────────────────────────────────────────
  const genInputHash = sha256({
    mapOutput: mapResult.output,
    existingEntityCount: existingLayer.entities.length,
    existingMeasureCount: existingLayer.measures.length,
  });

  const genResult = await executeStep<GenerateStepOutput>({
    scanRunId,
    reportId,
    stepNumber: 3,
    stepName: 'generate',
    inputHash: genInputHash,
    execute: () =>
      llmClient.generate(
        mapResult.output!,
        existingLayer,
        catalogEntries,
        reportId
      ),
  });

  if (!genResult.success) {
    return buildFailureResult(scanRunId, reportId, 'generate');
  }

  // ── Step 4 — Validate ──────────────────────────────────────────────
  const valInputHash = sha256({ generateOutput: genResult.output });

  const valResult = await executeStep<ValidateStepOutput>({
    scanRunId,
    reportId,
    stepNumber: 4,
    stepName: 'validate',
    inputHash: valInputHash,
    execute: () => validateAll(genResult.output!, tenantId),
  });

  if (!valResult.success) {
    return buildFailureResult(scanRunId, reportId, 'validate');
  }

  const validation = valResult.output!;

  // Record whether validation passed or failed in the trace status
  if (!validation.valid) {
    // Update the Step 4 trace to reflect validation failure
    // (the executeStep already recorded it as 'success' because
    // the validate function itself didn't throw — we need to
    // distinguish "ran successfully but found violations" from
    // "threw an exception")
    return {
      scanRunId,
      reportId,
      success: false,
      failedAtStep: 'validate',
      skipped: false,
      violations: validation.violations,
    };
  }

  return {
    scanRunId,
    reportId,
    success: true,
    failedAtStep: null,
    skipped: false,
    violations: validation.violations, // may contain warnings (VR-2)
    generatedOutput: genResult.output!,
  };
}

// ---------------------------------------------------------------------------
// Step execution wrapper
// ---------------------------------------------------------------------------

/** Parameters for executing a single chain step. */
interface StepParams<T> {
  scanRunId: string;
  reportId: string;
  stepNumber: number;
  stepName: ChainStepName;
  inputHash: string;
  execute: () => Promise<T>;
}

/** Result of a single step execution. */
interface StepResult<T> {
  success: boolean;
  output: T | null;
}

/**
 * Executes a single prompt chain step:
 *   1. Records the start time.
 *   2. Calls the step function.
 *   3. Persists the result (success or failure) to chain_traces.
 *   4. Returns the output or null on failure.
 *
 * On exception, the step is recorded as 'failed' with the error message
 * in the output artifact. The chain halts (AC-PC-3).
 *
 * @param params - Step configuration and execution function
 * @returns Step result with success flag and output
 */
async function executeStep<T>(
  params: StepParams<T>
): Promise<StepResult<T>> {
  const startMs = Date.now();
  let status: ChainTraceStatus = 'success';
  let output: Record<string, unknown> = {};

  try {
    const result = await params.execute();
    output = result as unknown as Record<string, unknown>;

    await scanRepo.appendChainTrace({
      scanRunId: params.scanRunId,
      reportId: params.reportId,
      stepNumber: params.stepNumber,
      stepName: params.stepName,
      inputHash: params.inputHash,
      output,
      status: 'success',
      durationMs: Date.now() - startMs,
    });

    return { success: true, output: result };
  } catch (error) {
    status = 'failed';
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    output = {
      error: errorMessage,
      step: params.stepName,
      failedAt: new Date().toISOString(),
    };

    // Persist the failure artifact so it can be inspected (FR-3, AC-PC-3)
    await scanRepo.appendChainTrace({
      scanRunId: params.scanRunId,
      reportId: params.reportId,
      stepNumber: params.stepNumber,
      stepName: params.stepName,
      inputHash: params.inputHash,
      output,
      status: 'failed',
      durationMs: Date.now() - startMs,
    });

    return { success: false, output: null };
  }
}

// ---------------------------------------------------------------------------
// Context loaders
// ---------------------------------------------------------------------------

/**
 * Loads all entries from the Entrata schema catalog.
 * These are passed to Steps 2 and 3 as grounding context.
 *
 * @returns All catalog entries across all tables
 */
async function loadCatalogEntries(): Promise<EntrataSchemaEntry[]> {
  const tables = await catalogRepo.listTables();
  const entries: EntrataSchemaEntry[] = [];

  for (const table of tables) {
    const columns = await catalogRepo.getColumnsForTable(table);
    entries.push(...columns);
  }

  return entries;
}

/**
 * Loads the current semantic layer state for a tenant.
 * This snapshot is passed to Step 3 so the LLM can deduplicate
 * against existing definitions (FR-8, AC-SM-4).
 *
 * @param tenantId - Tenant UUID
 * @returns Snapshot of existing entities, relationships, and measures
 */
async function loadExistingLayer(
  tenantId: string
): Promise<ExistingLayerSnapshot> {
  const [entities, relationships, measures] = await Promise.all([
    entityRepo.listEntities(tenantId),
    entityRepo.listRelationships(tenantId),
    measureRepo.listMeasures(tenantId),
  ]);

  return { entities, relationships, measures };
}

// ---------------------------------------------------------------------------
// Result builders
// ---------------------------------------------------------------------------

/**
 * Builds a failure result for when a chain step throws an exception.
 *
 * @param scanRunId    - Scan run UUID
 * @param reportId     - Report UUID
 * @param failedAtStep - The step name where failure occurred
 * @returns OrchestratorResult with success=false
 */
function buildFailureResult(
  scanRunId: string,
  reportId: string,
  failedAtStep: ChainStepName
): OrchestratorResult {
  return {
    scanRunId,
    reportId,
    success: false,
    failedAtStep,
    skipped: false,
    violations: [],
  };
}
