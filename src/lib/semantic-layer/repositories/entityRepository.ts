/**
 * Semantic Entity & Relationship Repository
 *
 * CRUD operations for `semantic_entities` and `semantic_relationships`.
 * All queries are tenant-scoped to enforce isolation (NFR-5).
 *
 * Requirements: FR-5, FR-6, FR-8, AC-SM-1, AC-SM-2, AC-SM-4
 * Design ref:   design.md §3.1 (`semantic_entities`, `semantic_relationships`)
 */

import { pool } from '../db/connection';
import type {
  SemanticEntity,
  SemanticEntityInput,
  SemanticRelationship,
  SemanticRelationshipInput,
} from '../types';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

/**
 * Creates a new semantic entity. Throws on duplicate (tenant_id, name).
 *
 * @param input - Entity fields (tenantId, name, description, sourceTables)
 * @returns The newly created entity with server-generated id and timestamps
 */
export async function createEntity(
  input: SemanticEntityInput
): Promise<SemanticEntity> {
  const { rows } = await pool.query<SemanticEntity>(
    `INSERT INTO semantic_entities
       (tenant_id, name, description, source_tables)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id, tenant_id AS "tenantId", name, description,
       source_tables AS "sourceTables",
       created_at AS "createdAt", updated_at AS "updatedAt"`,
    [input.tenantId, input.name, input.description, JSON.stringify(input.sourceTables)]
  );
  return rows[0];
}

/**
 * Finds an entity by tenant and name. Returns null if not found.
 * Used during the Generate step to detect duplicates (FR-8, AC-SM-4).
 *
 * @param tenantId - Tenant UUID
 * @param name     - Entity name (e.g., "unit")
 * @returns The matching entity or null
 */
export async function findEntityByName(
  tenantId: string,
  name: string
): Promise<SemanticEntity | null> {
  const { rows } = await pool.query<SemanticEntity>(
    `SELECT id, tenant_id AS "tenantId", name, description,
            source_tables AS "sourceTables",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM semantic_entities
     WHERE tenant_id = $1 AND name = $2`,
    [tenantId, name]
  );
  return rows[0] ?? null;
}

/**
 * Returns an entity by its primary key. Returns null if not found.
 *
 * @param id - Entity UUID
 * @returns The entity or null
 */
export async function findEntityById(
  id: string
): Promise<SemanticEntity | null> {
  const { rows } = await pool.query<SemanticEntity>(
    `SELECT id, tenant_id AS "tenantId", name, description,
            source_tables AS "sourceTables",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM semantic_entities
     WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Lists all entities for a tenant, ordered by name.
 *
 * @param tenantId - Tenant UUID
 * @returns Array of entities
 */
export async function listEntities(
  tenantId: string
): Promise<SemanticEntity[]> {
  const { rows } = await pool.query<SemanticEntity>(
    `SELECT id, tenant_id AS "tenantId", name, description,
            source_tables AS "sourceTables",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM semantic_entities
     WHERE tenant_id = $1
     ORDER BY name`,
    [tenantId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

/**
 * Creates or updates a relationship between two entities.
 * On conflict (same tenant + entity pair), updates join_type and
 * join_condition to the new values.
 *
 * @param input - Relationship fields
 * @returns The created or updated relationship
 */
export async function upsertRelationship(
  input: SemanticRelationshipInput
): Promise<SemanticRelationship> {
  const { rows } = await pool.query<SemanticRelationship>(
    `INSERT INTO semantic_relationships
       (tenant_id, from_entity_id, to_entity_id, join_type, join_condition)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tenant_id, from_entity_id, to_entity_id) DO UPDATE SET
       join_type      = EXCLUDED.join_type,
       join_condition = EXCLUDED.join_condition
     RETURNING
       id, tenant_id AS "tenantId",
       from_entity_id AS "fromEntityId", to_entity_id AS "toEntityId",
       join_type AS "joinType", join_condition AS "joinCondition",
       created_at AS "createdAt"`,
    [
      input.tenantId,
      input.fromEntityId,
      input.toEntityId,
      input.joinType,
      input.joinCondition,
    ]
  );
  return rows[0];
}

/**
 * Lists all relationships for a tenant.
 *
 * @param tenantId - Tenant UUID
 * @returns Array of relationships
 */
export async function listRelationships(
  tenantId: string
): Promise<SemanticRelationship[]> {
  const { rows } = await pool.query<SemanticRelationship>(
    `SELECT id, tenant_id AS "tenantId",
            from_entity_id AS "fromEntityId", to_entity_id AS "toEntityId",
            join_type AS "joinType", join_condition AS "joinCondition",
            created_at AS "createdAt"
     FROM semantic_relationships
     WHERE tenant_id = $1`,
    [tenantId]
  );
  return rows;
}

/**
 * Finds all relationships originating from or targeting a specific entity.
 *
 * @param entityId - Entity UUID
 * @returns Array of relationships involving this entity
 */
export async function findRelationshipsByEntity(
  entityId: string
): Promise<SemanticRelationship[]> {
  const { rows } = await pool.query<SemanticRelationship>(
    `SELECT id, tenant_id AS "tenantId",
            from_entity_id AS "fromEntityId", to_entity_id AS "toEntityId",
            join_type AS "joinType", join_condition AS "joinCondition",
            created_at AS "createdAt"
     FROM semantic_relationships
     WHERE from_entity_id = $1 OR to_entity_id = $1`,
    [entityId]
  );
  return rows;
}
