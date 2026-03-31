/**
 * Conflict Repository
 *
 * Manages the `conflicts` table — tracks cases where two or more reports
 * define the same metric with different logic. Conflicted metrics are
 * frozen at their last-approved version until a human resolves the conflict.
 *
 * Requirements: RM-4, RM-5, RM-6, AC-DP-2, AC-DP-3
 * Design ref:   design.md §3.1 (`conflicts`)
 */

import { pool } from '../db/connection';
import type {
  Conflict,
  ConflictInput,
  ConflictResolution,
  ConflictStatus,
} from '../types';

/** Shared column-aliasing fragment. */
const SELECT_COLUMNS = `
  id, tenant_id AS "tenantId", metric_name AS "metricName",
  report_a_id AS "reportAId", report_a_logic AS "reportALogic",
  report_b_id AS "reportBId", report_b_logic AS "reportBLogic",
  diff, status,
  resolved_by AS "resolvedBy", resolved_at AS "resolvedAt",
  created_at AS "createdAt"
`;

/**
 * Creates a new conflict record in "open" status.
 *
 * Called by the conflict detector when VR-3 identifies two reports
 * defining the same metric name with different logic (RM-4).
 *
 * @param input - Conflict fields (metric name, both report IDs/logic, diff)
 * @returns The newly created conflict
 */
export async function createConflict(input: ConflictInput): Promise<Conflict> {
  const { rows } = await pool.query<Conflict>(
    `INSERT INTO conflicts
       (tenant_id, metric_name, report_a_id, report_a_logic,
        report_b_id, report_b_logic, diff)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_COLUMNS}`,
    [
      input.tenantId,
      input.metricName,
      input.reportAId,
      input.reportALogic,
      input.reportBId,
      input.reportBLogic,
      JSON.stringify(input.diff),
    ]
  );
  return rows[0];
}

/**
 * Resolves an open conflict. Sets the status, records who resolved it,
 * and timestamps the resolution.
 *
 * The `resolution` parameter is informational here — it's the caller's
 * responsibility to apply the chosen logic (accept_a, accept_b, or custom)
 * to the semantic layer before calling this function.
 *
 * @param conflictId - Conflict UUID
 * @param resolution - How the conflict was resolved (accept_a | accept_b | custom)
 * @param userId     - UUID of the user who resolved it
 * @returns The updated conflict, or null if not found
 */
export async function resolveConflict(
  conflictId: string,
  resolution: ConflictResolution,
  userId: string
): Promise<Conflict | null> {
  // Store the resolution choice in the diff field for audit purposes
  const { rows } = await pool.query<Conflict>(
    `UPDATE conflicts SET
       status      = 'resolved',
       resolved_by = $2,
       resolved_at = now(),
       diff        = diff || jsonb_build_object('resolution', $3::text)
     WHERE id = $1 AND status = 'open'
     RETURNING ${SELECT_COLUMNS}`,
    [conflictId, userId, resolution]
  );
  return rows[0] ?? null;
}

/**
 * Dismisses a conflict without resolving it. The metric remains
 * frozen, but the conflict is removed from the active queue.
 *
 * @param conflictId - Conflict UUID
 * @param userId     - UUID of the user who dismissed it
 * @returns The updated conflict, or null if not found
 */
export async function dismissConflict(
  conflictId: string,
  userId: string
): Promise<Conflict | null> {
  const { rows } = await pool.query<Conflict>(
    `UPDATE conflicts SET
       status      = 'dismissed',
       resolved_by = $2,
       resolved_at = now()
     WHERE id = $1 AND status = 'open'
     RETURNING ${SELECT_COLUMNS}`,
    [conflictId, userId]
  );
  return rows[0] ?? null;
}

/**
 * Returns all open conflicts for a tenant. Used by the Conflict
 * Resolution Queue UI and the admin API.
 *
 * @param tenantId - Tenant UUID
 * @returns Array of open conflicts, newest first
 */
export async function listOpenConflicts(
  tenantId: string
): Promise<Conflict[]> {
  const { rows } = await pool.query<Conflict>(
    `SELECT ${SELECT_COLUMNS}
     FROM conflicts
     WHERE tenant_id = $1 AND status = 'open'
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return rows;
}

/**
 * Lists conflicts for a tenant filtered by status.
 *
 * @param tenantId - Tenant UUID
 * @param status   - Filter by conflict status
 * @returns Array of matching conflicts
 */
export async function listConflictsByStatus(
  tenantId: string,
  status: ConflictStatus
): Promise<Conflict[]> {
  const { rows } = await pool.query<Conflict>(
    `SELECT ${SELECT_COLUMNS}
     FROM conflicts
     WHERE tenant_id = $1 AND status = $2
     ORDER BY created_at DESC`,
    [tenantId, status]
  );
  return rows;
}

/**
 * Retrieves a single conflict by its primary key.
 *
 * @param conflictId - Conflict UUID
 * @returns The conflict or null
 */
export async function findConflictById(
  conflictId: string
): Promise<Conflict | null> {
  const { rows } = await pool.query<Conflict>(
    `SELECT ${SELECT_COLUMNS}
     FROM conflicts
     WHERE id = $1`,
    [conflictId]
  );
  return rows[0] ?? null;
}

/**
 * Checks whether an open conflict already exists for a given metric
 * in a tenant. Prevents duplicate conflict records for the same metric.
 *
 * @param tenantId   - Tenant UUID
 * @param metricName - The metric name to check
 * @returns true if an open conflict exists for this metric
 */
export async function hasOpenConflict(
  tenantId: string,
  metricName: string
): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM conflicts
     WHERE tenant_id = $1 AND metric_name = $2 AND status = 'open'
     LIMIT 1`,
    [tenantId, metricName]
  );
  return rows.length > 0;
}
