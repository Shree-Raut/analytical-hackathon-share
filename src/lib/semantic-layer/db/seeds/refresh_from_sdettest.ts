/**
 * Catalog Refresh from SDET Database
 *
 * Reads the real Entrata schema from the local sdettest `entrata_sdet_1`
 * database via information_schema and populates the `entrata_schema_catalog`
 * table on the target DATABASE_URL (hackathon RDS or local).
 *
 * Usage:
 *   SEMANTIC_DATABASE_URL=postgres://... SDET_URL=postgres://user@localhost:5432/entrata_sdet_1 \
 *     npx ts-node src/db/seeds/refresh_from_sdettest.ts
 *
 * Requirements: FR-15, FR-17, AC-SC-4
 * Design ref:   design.md §3.1 (entrata_schema_catalog)
 */

import { Pool } from 'pg';
import type { EntrataSchemaEntryInput } from '../../types';
import { refreshCatalog } from '../../repositories/catalogRepository';

const SDET_URL =
  process.env.SDET_URL ?? 'postgres://user@localhost:5432/entrata_sdet_1';

const EXCLUDED_SCHEMAS = ['pg_catalog', 'information_schema', 'pg_toast'];

/**
 * Queries information_schema on the SDET database to extract all columns,
 * primary keys, and foreign keys, then transforms them into
 * EntrataSchemaEntryInput records.
 */
async function introspectSdetSchema(): Promise<EntrataSchemaEntryInput[]> {
  const sdetPool = new Pool({ connectionString: SDET_URL });

  try {
    console.log(`Connecting to SDET database: ${SDET_URL.replace(/\/\/.*@/, '//<redacted>@')}`);

    const columnsResult = await sdetPool.query<{
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>(`
      SELECT table_schema, table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema NOT IN (${EXCLUDED_SCHEMAS.map((_, i) => `$${i + 1}`).join(', ')})
      ORDER BY table_schema, table_name, ordinal_position
    `, EXCLUDED_SCHEMAS);

    console.log(`Found ${columnsResult.rows.length} columns across schemas`);

    const pkResult = await sdetPool.query<{
      table_schema: string;
      table_name: string;
      column_name: string;
    }>(`
      SELECT kcu.table_schema, kcu.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema NOT IN (${EXCLUDED_SCHEMAS.map((_, i) => `$${i + 1}`).join(', ')})
    `, EXCLUDED_SCHEMAS);

    const pkSet = new Set(
      pkResult.rows.map(r => `${r.table_schema}.${r.table_name}.${r.column_name}`)
    );
    console.log(`Found ${pkResult.rows.length} primary key columns`);

    const fkResult = await sdetPool.query<{
      table_schema: string;
      table_name: string;
      column_name: string;
      fk_table_schema: string;
      fk_table_name: string;
      fk_column_name: string;
    }>(`
      SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_schema AS fk_table_schema,
        ccu.table_name   AS fk_table_name,
        ccu.column_name  AS fk_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN (${EXCLUDED_SCHEMAS.map((_, i) => `$${i + 1}`).join(', ')})
    `, EXCLUDED_SCHEMAS);

    const fkMap = new Map<string, { targetTable: string; targetColumn: string }>();
    for (const r of fkResult.rows) {
      const key = `${r.table_schema}.${r.table_name}.${r.column_name}`;
      fkMap.set(key, {
        targetTable: `${r.fk_table_schema}.${r.fk_table_name}`,
        targetColumn: r.fk_column_name,
      });
    }
    console.log(`Found ${fkResult.rows.length} foreign key columns`);

    const entries: EntrataSchemaEntryInput[] = columnsResult.rows.map(row => {
      const qualifiedTable = `${row.table_schema}.${row.table_name}`;
      const qualifiedColumn = `${row.table_schema}.${row.table_name}.${row.column_name}`;
      const fk = fkMap.get(qualifiedColumn);

      return {
        tableName: qualifiedTable,
        columnName: row.column_name,
        dataType: row.data_type,
        isPrimaryKey: pkSet.has(qualifiedColumn),
        isForeignKey: !!fk,
        fkTargetTable: fk?.targetTable ?? null,
        fkTargetColumn: fk?.targetColumn ?? null,
        isNullable: row.is_nullable === 'YES',
      };
    });

    return entries;
  } finally {
    await sdetPool.end();
  }
}

async function main() {
  console.log('=== Entrata Schema Catalog Refresh ===\n');
  console.log(
    `Target SEMANTIC_DATABASE_URL: ${(
      process.env.SEMANTIC_DATABASE_URL ??
      process.env.DATABASE_URL ??
      ""
    ).replace(/\/\/.*@/, "//<redacted>@")}`,
  );

  const entries = await introspectSdetSchema();

  const uniqueTables = new Set(entries.map(e => e.tableName));
  console.log(`\nReady to upsert ${entries.length} columns across ${uniqueTables.size} tables`);

  const result = await refreshCatalog(entries);

  console.log('\n=== Refresh Complete ===');
  console.log(`  Tables added:     ${result.tablesAdded}`);
  console.log(`  Tables removed:   ${result.tablesRemoved}`);
  console.log(`  Columns upserted: ${result.columnsUpserted}`);
  console.log(`  Columns removed:  ${result.columnsRemoved}`);
  console.log(`  Refreshed at:     ${result.refreshedAt.toISOString()}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Catalog refresh failed:', err);
  process.exit(1);
});
