/**
 * Schema Version & Audit Log Repository
 *
 * Manages versioned snapshots of the semantic layer and the append-only
 * audit log that tracks every mutation.
 *
 * Requirements: FR-10, FR-11, FR-14, NFR-3, AC-CU-3, AC-CO-2
 * Design ref:   design.md §3.1 (`schema_versions`, `audit_log`)
 */

import { pool } from '../db/connection';
import type {
  SchemaVersion,
  SchemaVersionInput,
  AuditLogEntry,
  AuditLogEntryInput,
} from '../types';

// ---------------------------------------------------------------------------
// Schema Versions
// ---------------------------------------------------------------------------

/**
 * Publishes a new schema version.
 *
 * Before inserting, enforces VR-7 (version monotonicity): the new version
 * string must be strictly greater than the current latest version for the
 * tenant. Throws if the version is not newer.
 *
 * @param input - Version fields including snapshot, diff, and metadata
 * @returns The published schema version with server-generated id and timestamp
 * @throws Error if the version string is not greater than the current latest
 */
export async function publishVersion(
  input: SchemaVersionInput
): Promise<SchemaVersion> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // VR-7: Check that the new version is strictly greater than the latest.
    // Uses string comparison which works for well-formed semver (e.g., "1.4.0").
    const { rows: latest } = await client.query<{ version: string }>(
      `SELECT version FROM schema_versions
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [input.tenantId]
    );

    if (latest.length > 0 && input.version <= latest[0].version) {
      throw new Error(
        `VR-7 violation: new version "${input.version}" must be greater ` +
        `than current version "${latest[0].version}"`
      );
    }

    const { rows } = await client.query<SchemaVersion>(
      `INSERT INTO schema_versions
         (tenant_id, version, snapshot, diff_from_prior,
          source_reports, agent_model_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id, tenant_id AS "tenantId", version,
         snapshot, diff_from_prior AS "diffFromPrior",
         source_reports AS "sourceReports",
         agent_model_version AS "agentModelVersion",
         created_at AS "createdAt"`,
      [
        input.tenantId,
        input.version,
        JSON.stringify(input.snapshot),
        input.diffFromPrior ? JSON.stringify(input.diffFromPrior) : null,
        JSON.stringify(input.sourceReports),
        input.agentModelVersion,
      ]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Returns the latest schema version for a tenant. Returns null if no
 * versions have been published yet.
 *
 * @param tenantId - Tenant UUID
 * @returns The latest version or null
 */
export async function getLatestVersion(
  tenantId: string
): Promise<SchemaVersion | null> {
  const { rows } = await pool.query<SchemaVersion>(
    `SELECT id, tenant_id AS "tenantId", version,
            snapshot, diff_from_prior AS "diffFromPrior",
            source_reports AS "sourceReports",
            agent_model_version AS "agentModelVersion",
            created_at AS "createdAt"
     FROM schema_versions
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [tenantId]
  );
  return rows[0] ?? null;
}

/**
 * Returns a specific schema version by tenant and version string.
 *
 * @param tenantId - Tenant UUID
 * @param version  - Semver string (e.g., "1.4.0")
 * @returns The matching version or null
 */
export async function getVersionByString(
  tenantId: string,
  version: string
): Promise<SchemaVersion | null> {
  const { rows } = await pool.query<SchemaVersion>(
    `SELECT id, tenant_id AS "tenantId", version,
            snapshot, diff_from_prior AS "diffFromPrior",
            source_reports AS "sourceReports",
            agent_model_version AS "agentModelVersion",
            created_at AS "createdAt"
     FROM schema_versions
     WHERE tenant_id = $1 AND version = $2`,
    [tenantId, version]
  );
  return rows[0] ?? null;
}

/**
 * Lists all schema versions for a tenant in reverse chronological order.
 *
 * @param tenantId - Tenant UUID
 * @returns Array of schema versions, newest first
 */
export async function listVersions(
  tenantId: string
): Promise<SchemaVersion[]> {
  const { rows } = await pool.query<SchemaVersion>(
    `SELECT id, tenant_id AS "tenantId", version,
            snapshot, diff_from_prior AS "diffFromPrior",
            source_reports AS "sourceReports",
            agent_model_version AS "agentModelVersion",
            created_at AS "createdAt"
     FROM schema_versions
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

/**
 * Appends an entry to the audit log. This table is append-only (FR-14);
 * entries are never updated or deleted.
 *
 * @param input - Audit entry fields
 * @returns The created audit log entry with server-generated id and timestamp
 */
export async function appendAuditEntry(
  input: AuditLogEntryInput
): Promise<AuditLogEntry> {
  const { rows } = await pool.query<AuditLogEntry>(
    `INSERT INTO audit_log
       (tenant_id, schema_version_id, action, target_type, target_id,
        before_state, after_state, triggered_by_report_id, scan_run_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING
       id, tenant_id AS "tenantId",
       schema_version_id AS "schemaVersionId",
       action, target_type AS "targetType", target_id AS "targetId",
       before_state AS "beforeState", after_state AS "afterState",
       triggered_by_report_id AS "triggeredByReportId",
       scan_run_id AS "scanRunId",
       created_at AS "createdAt"`,
    [
      input.tenantId,
      input.schemaVersionId,
      input.action,
      input.targetType,
      input.targetId,
      input.beforeState ? JSON.stringify(input.beforeState) : null,
      JSON.stringify(input.afterState),
      input.triggeredByReportId,
      input.scanRunId,
    ]
  );
  return rows[0];
}

/**
 * Queries the audit log for a tenant with optional filters.
 *
 * @param tenantId   - Tenant UUID
 * @param filters    - Optional filters for action, targetType, and date range
 * @returns Array of audit log entries, newest first
 */
export async function queryAuditLog(
  tenantId: string,
  filters?: {
    action?: string;
    targetType?: string;
    from?: Date;
    to?: Date;
  }
): Promise<AuditLogEntry[]> {
  const params: unknown[] = [tenantId];
  const conditions: string[] = ['tenant_id = $1'];
  let paramIndex = 2;

  if (filters?.action) {
    conditions.push(`action = $${paramIndex++}`);
    params.push(filters.action);
  }
  if (filters?.targetType) {
    conditions.push(`target_type = $${paramIndex++}`);
    params.push(filters.targetType);
  }
  if (filters?.from) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(filters.from);
  }
  if (filters?.to) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(filters.to);
  }

  const { rows } = await pool.query<AuditLogEntry>(
    `SELECT id, tenant_id AS "tenantId",
            schema_version_id AS "schemaVersionId",
            action, target_type AS "targetType", target_id AS "targetId",
            before_state AS "beforeState", after_state AS "afterState",
            triggered_by_report_id AS "triggeredByReportId",
            scan_run_id AS "scanRunId",
            created_at AS "createdAt"
     FROM audit_log
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC`,
    params
  );
  return rows;
}
