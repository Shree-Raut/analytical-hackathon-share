/**
 * Entrata Schema Catalog Repository
 *
 * Manages the `entrata_schema_catalog` table — the ground truth for the
 * Entrata database schema. The agent's Map and Validate steps resolve
 * entity and relationship proposals against this data.
 *
 * Requirements: FR-15, FR-16, FR-17, AC-SC-1..AC-SC-4
 * Design ref:   design.md §3.1 (`entrata_schema_catalog`)
 */

import { pool } from '../db/connection';
import type {
  EntrataSchemaEntry,
  EntrataSchemaEntryInput,
  CatalogRefreshResult,
} from '../types';

/**
 * Retrieves all catalog entries for a given table.
 *
 * @param tableName - Fully qualified table name (e.g., "public.units")
 * @returns Array of catalog entries (columns) for that table
 */
export async function getColumnsForTable(
  tableName: string
): Promise<EntrataSchemaEntry[]> {
  const { rows } = await pool.query<EntrataSchemaEntry>(
    `SELECT id, table_name AS "tableName", column_name AS "columnName",
            data_type AS "dataType", is_primary_key AS "isPrimaryKey",
            is_foreign_key AS "isForeignKey", fk_target_table AS "fkTargetTable",
            fk_target_column AS "fkTargetColumn", is_nullable AS "isNullable",
            refreshed_at AS "refreshedAt"
     FROM entrata_schema_catalog
     WHERE table_name = $1
     ORDER BY column_name`,
    [tableName]
  );
  return rows;
}

/**
 * Retrieves all foreign key entries originating from a given table.
 * Used during the Map step to discover join paths between entities.
 *
 * @param tableName - Source table name
 * @returns Array of catalog entries where is_foreign_key is true
 */
export async function getForeignKeysForTable(
  tableName: string
): Promise<EntrataSchemaEntry[]> {
  const { rows } = await pool.query<EntrataSchemaEntry>(
    `SELECT id, table_name AS "tableName", column_name AS "columnName",
            data_type AS "dataType", is_primary_key AS "isPrimaryKey",
            is_foreign_key AS "isForeignKey", fk_target_table AS "fkTargetTable",
            fk_target_column AS "fkTargetColumn", is_nullable AS "isNullable",
            refreshed_at AS "refreshedAt"
     FROM entrata_schema_catalog
     WHERE table_name = $1 AND is_foreign_key = true`,
    [tableName]
  );
  return rows;
}

/**
 * Checks whether a table exists in the catalog.
 * Used by VR-9 (catalog grounding) to reject entities that reference
 * non-existent Entrata tables.
 *
 * @param tableName - Fully qualified table name
 * @returns true if at least one column exists for this table
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM entrata_schema_catalog WHERE table_name = $1 LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

/**
 * Checks whether a specific column exists on a table in the catalog.
 * Used by VR-9 to validate join conditions reference real columns.
 *
 * @param tableName  - Fully qualified table name
 * @param columnName - Column to look up
 * @returns true if the column exists on the table
 */
export async function columnExists(
  tableName: string,
  columnName: string
): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM entrata_schema_catalog
     WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

/**
 * Returns all distinct table names currently in the catalog.
 *
 * @returns Array of table name strings
 */
export async function listTables(): Promise<string[]> {
  const { rows } = await pool.query<{ tableName: string }>(
    `SELECT DISTINCT table_name AS "tableName"
     FROM entrata_schema_catalog
     ORDER BY table_name`
  );
  return rows.map((r) => r.tableName);
}

/**
 * Upserts a batch of catalog entries and removes any entries that no
 * longer exist in the source database. This is the core of the catalog
 * refresh logic (FR-17, AC-SC-4).
 *
 * The function:
 * 1. Upserts every entry from `entries` (insert or update on conflict).
 * 2. Deletes catalog rows whose (table_name, column_name) pair does not
 *    appear in the incoming batch — these represent dropped columns/tables.
 * 3. Returns a summary of what changed.
 *
 * @param entries - The full set of columns from the Entrata information_schema
 * @returns Summary counts of additions, removals, and upserts
 */
export async function refreshCatalog(
  entries: EntrataSchemaEntryInput[]
): Promise<CatalogRefreshResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const now = new Date();
    let columnsUpserted = 0;

    // Upsert every incoming entry
    for (const entry of entries) {
      await client.query(
        `INSERT INTO entrata_schema_catalog
           (table_name, column_name, data_type, is_primary_key,
            is_foreign_key, fk_target_table, fk_target_column,
            is_nullable, refreshed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (table_name, column_name) DO UPDATE SET
           data_type       = EXCLUDED.data_type,
           is_primary_key  = EXCLUDED.is_primary_key,
           is_foreign_key  = EXCLUDED.is_foreign_key,
           fk_target_table = EXCLUDED.fk_target_table,
           fk_target_column = EXCLUDED.fk_target_column,
           is_nullable     = EXCLUDED.is_nullable,
           refreshed_at    = EXCLUDED.refreshed_at`,
        [
          entry.tableName,
          entry.columnName,
          entry.dataType,
          entry.isPrimaryKey,
          entry.isForeignKey,
          entry.fkTargetTable,
          entry.fkTargetColumn,
          entry.isNullable,
          now,
        ]
      );
      columnsUpserted++;
    }

    // Build a set of (table_name, column_name) pairs from the incoming data
    // to identify which existing rows should be removed (dropped columns).
    const incomingPairs = entries.map((e) => `(${e.tableName}, ${e.columnName})`);

    let columnsRemoved = 0;
    if (entries.length > 0) {
      // Delete rows that were NOT in the incoming batch
      const deleteResult = await client.query(
        `DELETE FROM entrata_schema_catalog
         WHERE (table_name, column_name) NOT IN (
           SELECT table_name, column_name
           FROM entrata_schema_catalog
           WHERE refreshed_at = $1
         )`,
        [now]
      );
      columnsRemoved = deleteResult.rowCount ?? 0;
    } else {
      // If the incoming set is empty, clear the entire catalog
      const deleteResult = await client.query(
        `DELETE FROM entrata_schema_catalog`
      );
      columnsRemoved = deleteResult.rowCount ?? 0;
    }

    // Compute table-level change counts for the summary
    const incomingTables = new Set(entries.map((e) => e.tableName));
    const { rows: existingTableRows } = await client.query<{ tableName: string }>(
      `SELECT DISTINCT table_name AS "tableName" FROM entrata_schema_catalog`
    );
    const existingTables = new Set(existingTableRows.map((r) => r.tableName));

    const tablesAdded = [...incomingTables].filter((t) => !existingTables.has(t)).length;
    const tablesRemoved = [...existingTables].filter((t) => !incomingTables.has(t)).length;

    await client.query('COMMIT');

    return {
      tablesAdded,
      tablesRemoved,
      columnsUpserted,
      columnsRemoved,
      refreshedAt: now,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
