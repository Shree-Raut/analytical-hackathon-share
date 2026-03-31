/**
 * Scan Run & Chain Trace Repository
 *
 * Manages `scan_runs` (scheduled scan executions) and `chain_traces`
 * (intermediate artifacts from each prompt chain step).
 *
 * Requirements: FR-3, FR-12, FR-13, NFR-3, AC-PC-1
 * Design ref:   design.md §3.1 (`scan_runs`, `chain_traces`)
 */

import { pool } from '../db/connection';
import type {
  ScanRun,
  ScanRunStatus,
  ChainTrace,
  ChainTraceInput,
} from '../types';

// ---------------------------------------------------------------------------
// Scan Runs
// ---------------------------------------------------------------------------

/**
 * Creates a new scan run in "pending" status.
 *
 * @param tenantId - Tenant UUID
 * @returns The newly created scan run
 */
export async function createScanRun(tenantId: string): Promise<ScanRun> {
  const { rows } = await pool.query<ScanRun>(
    `INSERT INTO scan_runs (tenant_id, status)
     VALUES ($1, 'pending')
     RETURNING
       id, tenant_id AS "tenantId", status,
       reports_scanned AS "reportsScanned",
       changes_detected AS "changesDetected",
       conflicts_flagged AS "conflictsFlagged",
       started_at AS "startedAt", completed_at AS "completedAt"`,
    [tenantId]
  );
  return rows[0];
}

/**
 * Transitions a scan run to a new status and optionally updates its
 * summary counters.
 *
 * @param runId   - Scan run UUID
 * @param status  - New status
 * @param summary - Optional counter updates
 * @returns The updated scan run
 */
export async function updateScanRunStatus(
  runId: string,
  status: ScanRunStatus,
  summary?: {
    reportsScanned?: number;
    changesDetected?: number;
    conflictsFlagged?: number;
  }
): Promise<ScanRun> {
  // Set completed_at when transitioning to a terminal state
  const isTerminal = status === 'completed' || status === 'failed';

  const { rows } = await pool.query<ScanRun>(
    `UPDATE scan_runs SET
       status            = $2,
       reports_scanned   = COALESCE($3, reports_scanned),
       changes_detected  = COALESCE($4, changes_detected),
       conflicts_flagged = COALESCE($5, conflicts_flagged),
       completed_at      = CASE WHEN $6 THEN now() ELSE completed_at END
     WHERE id = $1
     RETURNING
       id, tenant_id AS "tenantId", status,
       reports_scanned AS "reportsScanned",
       changes_detected AS "changesDetected",
       conflicts_flagged AS "conflictsFlagged",
       started_at AS "startedAt", completed_at AS "completedAt"`,
    [
      runId,
      status,
      summary?.reportsScanned ?? null,
      summary?.changesDetected ?? null,
      summary?.conflictsFlagged ?? null,
      isTerminal,
    ]
  );
  return rows[0];
}

/**
 * Retrieves a scan run by its primary key.
 *
 * @param runId - Scan run UUID
 * @returns The scan run or null
 */
export async function findScanRunById(runId: string): Promise<ScanRun | null> {
  const { rows } = await pool.query<ScanRun>(
    `SELECT id, tenant_id AS "tenantId", status,
            reports_scanned AS "reportsScanned",
            changes_detected AS "changesDetected",
            conflicts_flagged AS "conflictsFlagged",
            started_at AS "startedAt", completed_at AS "completedAt"
     FROM scan_runs
     WHERE id = $1`,
    [runId]
  );
  return rows[0] ?? null;
}

/**
 * Lists scan runs for a tenant in reverse chronological order.
 *
 * @param tenantId - Tenant UUID
 * @returns Array of scan runs, newest first
 */
export async function listScanRuns(tenantId: string): Promise<ScanRun[]> {
  const { rows } = await pool.query<ScanRun>(
    `SELECT id, tenant_id AS "tenantId", status,
            reports_scanned AS "reportsScanned",
            changes_detected AS "changesDetected",
            conflicts_flagged AS "conflictsFlagged",
            started_at AS "startedAt", completed_at AS "completedAt"
     FROM scan_runs
     WHERE tenant_id = $1
     ORDER BY started_at DESC`,
    [tenantId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Chain Traces
// ---------------------------------------------------------------------------

/**
 * Appends a chain trace record for a single prompt chain step.
 * Each scan run processes one or more reports, and each report
 * produces up to four trace records (steps 1–4).
 *
 * @param input - Trace fields including step number, name, hash, output, status
 * @returns The created chain trace with server-generated id and timestamp
 */
export async function appendChainTrace(
  input: ChainTraceInput
): Promise<ChainTrace> {
  const { rows } = await pool.query<ChainTrace>(
    `INSERT INTO chain_traces
       (scan_run_id, report_id, step_number, step_name,
        input_hash, output, status, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING
       id, scan_run_id AS "scanRunId", report_id AS "reportId",
       step_number AS "stepNumber", step_name AS "stepName",
       input_hash AS "inputHash", output, status,
       duration_ms AS "durationMs", created_at AS "createdAt"`,
    [
      input.scanRunId,
      input.reportId,
      input.stepNumber,
      input.stepName,
      input.inputHash,
      JSON.stringify(input.output),
      input.status,
      input.durationMs,
    ]
  );
  return rows[0];
}

/**
 * Returns all chain traces for a scan run, ordered by step number.
 *
 * @param scanRunId - Scan run UUID
 * @returns Array of chain traces for the run
 */
export async function listTracesForRun(
  scanRunId: string
): Promise<ChainTrace[]> {
  const { rows } = await pool.query<ChainTrace>(
    `SELECT id, scan_run_id AS "scanRunId", report_id AS "reportId",
            step_number AS "stepNumber", step_name AS "stepName",
            input_hash AS "inputHash", output, status,
            duration_ms AS "durationMs", created_at AS "createdAt"
     FROM chain_traces
     WHERE scan_run_id = $1
     ORDER BY report_id, step_number`,
    [scanRunId]
  );
  return rows;
}

/**
 * Returns the most recent chain trace for a given report and step.
 * Used by the idempotency guard (VR-8) to compare input hashes.
 *
 * @param reportId   - Report UUID
 * @param stepNumber - Step number (1–4)
 * @returns The latest trace for this report + step, or null
 */
export async function getLatestTraceForReport(
  reportId: string,
  stepNumber: number
): Promise<ChainTrace | null> {
  const { rows } = await pool.query<ChainTrace>(
    `SELECT id, scan_run_id AS "scanRunId", report_id AS "reportId",
            step_number AS "stepNumber", step_name AS "stepName",
            input_hash AS "inputHash", output, status,
            duration_ms AS "durationMs", created_at AS "createdAt"
     FROM chain_traces
     WHERE report_id = $1 AND step_number = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [reportId, stepNumber]
  );
  return rows[0] ?? null;
}
