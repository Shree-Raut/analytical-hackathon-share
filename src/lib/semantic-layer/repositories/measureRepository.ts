/**
 * Semantic Measure Repository
 *
 * CRUD operations for `semantic_measures`. All queries are tenant-scoped
 * to enforce isolation (NFR-5).
 *
 * Requirements: FR-7, FR-8, AC-SM-3, AC-SM-4
 * Design ref:   design.md §3.1 (`semantic_measures`)
 */

import { pool } from '../db/connection';
import type { SemanticMeasure, SemanticMeasureInput } from '../types';

/** Shared column-aliasing fragment to avoid repetition. */
const SELECT_COLUMNS = `
  id, tenant_id AS "tenantId", name, display_name AS "displayName",
  expression, measure_type AS "measureType",
  entity_id AS "entityId",
  dependent_measures AS "dependentMeasures",
  source_report_ids AS "sourceReportIds",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

/**
 * Creates a new semantic measure. Throws on duplicate (tenant_id, name).
 *
 * @param input - Measure fields
 * @returns The newly created measure with server-generated id and timestamps
 */
export async function createMeasure(
  input: SemanticMeasureInput
): Promise<SemanticMeasure> {
  const { rows } = await pool.query<SemanticMeasure>(
    `INSERT INTO semantic_measures
       (tenant_id, name, display_name, expression, measure_type,
        entity_id, dependent_measures, source_report_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_COLUMNS}`,
    [
      input.tenantId,
      input.name,
      input.displayName,
      input.expression,
      input.measureType,
      input.entityId,
      JSON.stringify(input.dependentMeasures),
      JSON.stringify(input.sourceReportIds),
    ]
  );
  return rows[0];
}

/**
 * Finds a measure by tenant and name. Returns null if not found.
 * Used during the Generate step for deduplication (FR-8, AC-SM-4)
 * and by VR-3 to detect conflicting measure definitions.
 *
 * @param tenantId - Tenant UUID
 * @param name     - Machine-readable measure name (e.g., "net_effective_rent")
 * @returns The matching measure or null
 */
export async function findMeasureByName(
  tenantId: string,
  name: string
): Promise<SemanticMeasure | null> {
  const { rows } = await pool.query<SemanticMeasure>(
    `SELECT ${SELECT_COLUMNS}
     FROM semantic_measures
     WHERE tenant_id = $1 AND name = $2`,
    [tenantId, name]
  );
  return rows[0] ?? null;
}

/**
 * Returns a measure by its primary key.
 *
 * @param id - Measure UUID
 * @returns The measure or null
 */
export async function findMeasureById(
  id: string
): Promise<SemanticMeasure | null> {
  const { rows } = await pool.query<SemanticMeasure>(
    `SELECT ${SELECT_COLUMNS}
     FROM semantic_measures
     WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Lists all measures for a tenant, ordered by name.
 * Supports optional filter by measure type.
 *
 * @param tenantId    - Tenant UUID
 * @param measureType - Optional filter: "base" or "derived"
 * @returns Array of measures
 */
export async function listMeasures(
  tenantId: string,
  measureType?: 'base' | 'derived'
): Promise<SemanticMeasure[]> {
  const params: (string | undefined)[] = [tenantId];
  let whereClause = 'WHERE tenant_id = $1';

  if (measureType) {
    whereClause += ' AND measure_type = $2';
    params.push(measureType);
  }

  const { rows } = await pool.query<SemanticMeasure>(
    `SELECT ${SELECT_COLUMNS}
     FROM semantic_measures
     ${whereClause}
     ORDER BY name`,
    params
  );
  return rows;
}

/**
 * Lists all measures that depend on a given measure ID.
 * Useful for lineage traversal: finding which derived measures
 * reference a base measure.
 *
 * @param measureId - The measure to search for in dependent_measures arrays
 * @param tenantId  - Tenant UUID for scoping
 * @returns Array of measures whose dependentMeasures includes measureId
 */
export async function findDependentMeasures(
  measureId: string,
  tenantId: string
): Promise<SemanticMeasure[]> {
  const { rows } = await pool.query<SemanticMeasure>(
    `SELECT ${SELECT_COLUMNS}
     FROM semantic_measures
     WHERE tenant_id = $1 AND dependent_measures @> $2::jsonb`,
    [tenantId, JSON.stringify([measureId])]
  );
  return rows;
}
