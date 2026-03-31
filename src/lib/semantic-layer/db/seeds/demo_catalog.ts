/**
 * Demo Catalog Seed — Task 0.2
 *
 * Populates `entrata_schema_catalog` with the Entrata property management
 * tables needed for the Net Effective Rent demo:
 *   - properties (id, name, address, ...)
 *   - units (id, property_id, unit_number, ...)
 *   - leases (id, unit_id, start_date, end_date, gross_rent, lease_term, ...)
 *   - concessions (id, lease_id, amount, type, ...)
 *   - residents (id, lease_id, first_name, last_name, ...)
 *
 * Foreign key chain for Net Effective Rent: unit → lease → concession
 *   leases.unit_id → units.id
 *   concessions.lease_id → leases.id
 *
 * Requirements: FR-15, DR-3, AC-SC-1
 * Design ref:   design.md §3.1 (`entrata_schema_catalog`), §8 (demo walkthrough)
 */

import type { EntrataSchemaEntryInput } from '../../types';
import { refreshCatalog } from '../../repositories/catalogRepository';

/**
 * The full set of columns representing the Entrata property management
 * schema slice relevant to the demo. Each entry mirrors a row that would
 * come from querying `information_schema.columns` + `key_column_usage`.
 */
const DEMO_CATALOG_ENTRIES: EntrataSchemaEntryInput[] = [
  // ── properties ──────────────────────────────────────────────────────
  { tableName: 'public.properties', columnName: 'id',      dataType: 'uuid',         isPrimaryKey: true,  isForeignKey: false, fkTargetTable: null,           fkTargetColumn: null, isNullable: false },
  { tableName: 'public.properties', columnName: 'name',    dataType: 'varchar(255)',  isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,           fkTargetColumn: null, isNullable: false },
  { tableName: 'public.properties', columnName: 'address', dataType: 'text',          isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,           fkTargetColumn: null, isNullable: true  },

  // ── units ───────────────────────────────────────────────────────────
  { tableName: 'public.units', columnName: 'id',          dataType: 'uuid',         isPrimaryKey: true,  isForeignKey: false, fkTargetTable: null,                 fkTargetColumn: null, isNullable: false },
  { tableName: 'public.units', columnName: 'property_id', dataType: 'uuid',         isPrimaryKey: false, isForeignKey: true,  fkTargetTable: 'public.properties',  fkTargetColumn: 'id', isNullable: false },
  { tableName: 'public.units', columnName: 'unit_number', dataType: 'varchar(50)',   isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,                 fkTargetColumn: null, isNullable: false },
  { tableName: 'public.units', columnName: 'bedrooms',    dataType: 'integer',       isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,                 fkTargetColumn: null, isNullable: true  },
  { tableName: 'public.units', columnName: 'bathrooms',   dataType: 'numeric(3,1)',  isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,                 fkTargetColumn: null, isNullable: true  },
  { tableName: 'public.units', columnName: 'sqft',        dataType: 'integer',       isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,                 fkTargetColumn: null, isNullable: true  },

  // ── leases ──────────────────────────────────────────────────────────
  { tableName: 'public.leases', columnName: 'id',         dataType: 'uuid',         isPrimaryKey: true,  isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },
  { tableName: 'public.leases', columnName: 'unit_id',    dataType: 'uuid',         isPrimaryKey: false, isForeignKey: true,  fkTargetTable: 'public.units',  fkTargetColumn: 'id', isNullable: false },
  { tableName: 'public.leases', columnName: 'start_date', dataType: 'date',          isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },
  { tableName: 'public.leases', columnName: 'end_date',   dataType: 'date',          isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },
  { tableName: 'public.leases', columnName: 'gross_rent', dataType: 'numeric(10,2)', isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },
  { tableName: 'public.leases', columnName: 'lease_term', dataType: 'integer',       isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },
  { tableName: 'public.leases', columnName: 'status',     dataType: 'varchar(20)',   isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,            fkTargetColumn: null, isNullable: false },

  // ── concessions ─────────────────────────────────────────────────────
  { tableName: 'public.concessions', columnName: 'id',       dataType: 'uuid',         isPrimaryKey: true,  isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null,   isNullable: false },
  { tableName: 'public.concessions', columnName: 'lease_id', dataType: 'uuid',         isPrimaryKey: false, isForeignKey: true,  fkTargetTable: 'public.leases',  fkTargetColumn: 'id',   isNullable: false },
  { tableName: 'public.concessions', columnName: 'amount',   dataType: 'numeric(10,2)', isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null,   isNullable: false },
  { tableName: 'public.concessions', columnName: 'type',     dataType: 'varchar(50)',   isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null,   isNullable: true  },

  // ── residents ───────────────────────────────────────────────────────
  { tableName: 'public.residents', columnName: 'id',         dataType: 'uuid',        isPrimaryKey: true,  isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null, isNullable: false },
  { tableName: 'public.residents', columnName: 'lease_id',   dataType: 'uuid',        isPrimaryKey: false, isForeignKey: true,  fkTargetTable: 'public.leases',  fkTargetColumn: 'id', isNullable: false },
  { tableName: 'public.residents', columnName: 'first_name', dataType: 'varchar(100)', isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null, isNullable: false },
  { tableName: 'public.residents', columnName: 'last_name',  dataType: 'varchar(100)', isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null, isNullable: false },
  { tableName: 'public.residents', columnName: 'email',      dataType: 'varchar(255)', isPrimaryKey: false, isForeignKey: false, fkTargetTable: null,             fkTargetColumn: null, isNullable: true  },
];

/**
 * Seeds the Entrata schema catalog with demo property management tables.
 * Idempotent — uses the `refreshCatalog` upsert mechanism.
 *
 * @returns Summary of the seed operation
 */
export async function seedDemoCatalog() {
  console.log(`Seeding demo catalog with ${DEMO_CATALOG_ENTRIES.length} columns across 5 tables...`);
  const result = await refreshCatalog(DEMO_CATALOG_ENTRIES);
  console.log(
    `Seed complete: ${result.columnsUpserted} columns upserted, ` +
    `${result.columnsRemoved} removed`
  );
  return result;
}

export { DEMO_CATALOG_ENTRIES };
