/**
 * Scan Scheduler — Task 5.1
 *
 * Cron-driven loop that periodically re-scans registered report sources,
 * compares current logic hashes against the last-processed snapshot, and
 * triggers the orchestrator only for reports whose logic has changed.
 *
 * Key flows:
 *   - `triggerScan(tenantId)` — runs a full scan for one tenant:
 *       1. Creates a `scan_runs` record in "running" status
 *       2. Lists report sources via the adapter (NFR-4)
 *       3. For each source, hashes current logic and compares against the
 *          last Step 1 trace hash (FR-13 delta detection)
 *       4. If changed, runs `processReport` then `detectConflicts`
 *       5. Updates the scan run summary counters and completes
 *
 *   - `manualTrigger()` — convenience wrapper for triggering a one-off
 *     scan outside the cron schedule. Used by the Admin API
 *     (POST /api/v1/admin/semantic/scan/trigger).
 *
 *   - `startScheduler()` / `stopScheduler()` — manages the setInterval
 *     loop for periodic scanning (FR-12 configurable schedule).
 *
 * Requirements: FR-12, FR-13, RM-1, RM-2, AC-CU-1, AC-CU-2
 * Design ref:   design.md §1 (Scan Scheduler component),
 *               design.md §7.1 (Scan failure handling),
 *               design.md §7.2 (Report source fetch retry)
 */

import { processReport } from './orchestrator';
import { detectConflicts } from './conflictDetector';
import { sha256 } from './hashUtils';
import * as scanRepo from '../repositories/scanRepository';
import type { LlmClient } from './llmClient';
import type {
  NotificationChannel,
  ReportSourceAdapter,
  ScanResult,
  ScanSchedulerConfig,
  ReportSource,
} from '../types';

// ---------------------------------------------------------------------------
// Scheduler state (module-level singleton)
// ---------------------------------------------------------------------------

/** Handle returned by setInterval; null when the scheduler is stopped. */
let schedulerHandle: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// Core scan logic
// ---------------------------------------------------------------------------

/**
 * Executes a full scan for a single tenant. This is the main entry point
 * called by both the cron loop and the manual trigger.
 *
 * For each registered report source:
 *   1. Hash the current logic
 *   2. Compare against the last-processed hash (idempotency, FR-13)
 *   3. If changed: run the orchestrator pipeline, then conflict detection
 *   4. Track per-report results for the scan summary
 *
 * @param tenantId  - Tenant UUID to scan
 * @param adapter   - Report source adapter (reads current logic from report system)
 * @param llmClient - LLM client for the prompt chain
 * @param channel   - Notification channel for conflict alerts
 * @returns Scan result with summary counters and per-report outcomes
 */
export async function triggerScan(
  tenantId: string,
  adapter: ReportSourceAdapter,
  llmClient: LlmClient,
  channel: NotificationChannel
): Promise<ScanResult> {
  // Create a scan run record so every action is traceable (NFR-3)
  const scanRun = await scanRepo.createScanRun(tenantId);

  await scanRepo.updateScanRunStatus(scanRun.id, 'running');

  const result: ScanResult = {
    scanRunId: scanRun.id,
    tenantId,
    reportsScanned: 0,
    changesDetected: 0,
    conflictsFlagged: 0,
    reportResults: [],
  };

  let sources: ReportSource[];
  try {
    sources = await adapter.listSources(tenantId);
  } catch (err) {
    // Report source adapter failure — mark the scan as failed (design.md §7.1)
    await scanRepo.updateScanRunStatus(scanRun.id, 'failed', {
      reportsScanned: 0,
      changesDetected: 0,
      conflictsFlagged: 0,
    });
    throw err;
  }

  for (const source of sources) {
    result.reportsScanned += 1;

    const reportResult = await processReportSource(
      source,
      tenantId,
      scanRun.id,
      llmClient,
      channel
    );

    result.reportResults.push(reportResult);

    if (!reportResult.skipped) {
      result.changesDetected += 1;
    }
    result.conflictsFlagged += reportResult.conflictsCreated;
  }

  // Finalize the scan run with summary counters
  await scanRepo.updateScanRunStatus(scanRun.id, 'completed', {
    reportsScanned: result.reportsScanned,
    changesDetected: result.changesDetected,
    conflictsFlagged: result.conflictsFlagged,
  });

  return result;
}

/**
 * Processes a single report source within a scan.
 *
 * Hashes the current logic to detect changes (FR-13). If the hash
 * matches the last-processed hash for this report, the report is
 * skipped (AC-CU-2). Otherwise, the full orchestrator pipeline runs,
 * followed by conflict detection.
 *
 * @param source    - Report source with current logic
 * @param tenantId  - Tenant UUID
 * @param scanRunId - Parent scan run UUID
 * @param llmClient - LLM client for the prompt chain
 * @param channel   - Notification channel for conflict alerts
 * @returns Per-report outcome with skip/success flags and conflict count
 */
async function processReportSource(
  source: ReportSource,
  tenantId: string,
  scanRunId: string,
  llmClient: LlmClient,
  channel: NotificationChannel
): Promise<{
  reportId: string;
  skipped: boolean;
  success: boolean;
  conflictsCreated: number;
}> {
  // The orchestrator already contains an idempotency guard (VR-8) that
  // checks the input hash against the last trace. We could duplicate
  // the check here, but letting the orchestrator handle it keeps the
  // logic in one place and ensures trace records are written consistently.
  const orchestratorResult = await processReport(
    {
      tenantId,
      reportId: source.id,
      logic: source.currentLogic,
      logicType: source.logicType,
      scanRunId,
    },
    llmClient
  );

  // If skipped by idempotency (unchanged logic), no further work needed
  if (orchestratorResult.skipped) {
    return {
      reportId: source.id,
      skipped: true,
      success: true,
      conflictsCreated: 0,
    };
  }

  // If the orchestrator failed, record the failure but don't stop the scan
  if (!orchestratorResult.success) {
    return {
      reportId: source.id,
      skipped: false,
      success: false,
      conflictsCreated: 0,
    };
  }

  // Orchestrator succeeded with generated output — run conflict detection
  let conflictsCreated = 0;

  if (orchestratorResult.generatedOutput) {
    const conflictResult = await detectConflicts(
      tenantId,
      source.id,
      orchestratorResult.generatedOutput,
      channel
    );
    conflictsCreated = conflictResult.conflictsCreated;
  }

  return {
    reportId: source.id,
    skipped: false,
    success: true,
    conflictsCreated,
  };
}

// ---------------------------------------------------------------------------
// Manual trigger
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper for triggering a one-off scan outside the cron
 * schedule. Used by the Admin API endpoint
 * `POST /api/v1/admin/semantic/scan/trigger`.
 *
 * Accepts the same dependencies as `triggerScan` and delegates directly.
 *
 * @param tenantId  - Tenant UUID to scan
 * @param adapter   - Report source adapter
 * @param llmClient - LLM client for the prompt chain
 * @param channel   - Notification channel for conflict alerts
 * @returns Scan result with summary counters
 */
export async function manualTrigger(
  tenantId: string,
  adapter: ReportSourceAdapter,
  llmClient: LlmClient,
  channel: NotificationChannel
): Promise<ScanResult> {
  return triggerScan(tenantId, adapter, llmClient, channel);
}

// ---------------------------------------------------------------------------
// Interval-based scheduler (FR-12)
// ---------------------------------------------------------------------------

/**
 * Starts the periodic scan scheduler. Calls `triggerScan` at the
 * configured interval for the specified tenant.
 *
 * The scheduler is a simple setInterval loop. For production, this would
 * be replaced by a proper cron library (e.g., node-cron) or an external
 * scheduler (CloudWatch Events, Kubernetes CronJob), but the interface
 * remains the same.
 *
 * @param config    - Scheduler configuration (interval, concurrency)
 * @param tenantId  - Tenant UUID to scan on each tick
 * @param adapter   - Report source adapter
 * @param llmClient - LLM client for the prompt chain
 * @param channel   - Notification channel for conflict alerts
 */
export function startScheduler(
  config: ScanSchedulerConfig,
  tenantId: string,
  adapter: ReportSourceAdapter,
  llmClient: LlmClient,
  channel: NotificationChannel
): void {
  if (schedulerHandle !== null) {
    throw new Error(
      'Scan scheduler is already running. Call stopScheduler() first.'
    );
  }

  schedulerHandle = setInterval(async () => {
    try {
      await triggerScan(tenantId, adapter, llmClient, channel);
    } catch (err) {
      // Log but don't crash the scheduler — next tick will retry (design.md §7.1)
      console.error('[SCAN SCHEDULER] Scan failed:', err);
    }
  }, config.intervalMs);
}

/**
 * Stops the periodic scan scheduler. Safe to call even if the scheduler
 * is not running (no-op in that case).
 */
export function stopScheduler(): void {
  if (schedulerHandle !== null) {
    clearInterval(schedulerHandle);
    schedulerHandle = null;
  }
}

/**
 * Returns whether the scheduler is currently running.
 * Useful for health checks and the Admin UI status dashboard.
 *
 * @returns true if the interval loop is active
 */
export function isSchedulerRunning(): boolean {
  return schedulerHandle !== null;
}
