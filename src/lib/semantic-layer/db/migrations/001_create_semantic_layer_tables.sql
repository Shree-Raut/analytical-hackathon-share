-- Migration 001: Create all semantic layer tables
-- Implements design.md §3.1 (data model) and §3.2 (indexes)
--
-- Requirement coverage:
--   Tables:  FR-5..FR-8, FR-10..FR-14, FR-15..FR-17, RM-4..RM-6, NFR-3, NFR-5
--   Indexes: design.md §3.2

BEGIN;

-- =========================================================================
-- Task 0: Entrata Schema Catalog (FR-15, FR-16, FR-17, AC-SC-1..AC-SC-4)
-- Ground truth for the Entrata database schema. The agent's Map and
-- Validate steps resolve entity/relationship proposals against this table.
-- =========================================================================

CREATE TABLE entrata_schema_catalog (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      VARCHAR(255)  NOT NULL,
  column_name     VARCHAR(255)  NOT NULL,
  data_type       VARCHAR(100)  NOT NULL,
  is_primary_key  BOOLEAN       NOT NULL DEFAULT false,
  is_foreign_key  BOOLEAN       NOT NULL DEFAULT false,
  fk_target_table  VARCHAR(255),
  fk_target_column VARCHAR(255),
  is_nullable     BOOLEAN       NOT NULL DEFAULT true,
  refreshed_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (table_name, column_name)
);

CREATE INDEX idx_catalog_fk_lookup
  ON entrata_schema_catalog (table_name)
  WHERE is_foreign_key = true;

-- =========================================================================
-- Task 1: Semantic Entities (FR-5, NFR-5, AC-SM-1)
-- Domain objects extracted from metric logic, scoped per tenant.
-- =========================================================================

CREATE TABLE semantic_entities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL,
  name          VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL DEFAULT '',
  source_tables JSONB         NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, name)
);

CREATE INDEX idx_entities_tenant_name
  ON semantic_entities (tenant_id, name);

-- =========================================================================
-- Task 1: Semantic Relationships (FR-6, AC-SM-2)
-- Join paths between entities required to compute metrics.
-- =========================================================================

CREATE TABLE semantic_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL,
  from_entity_id  UUID          NOT NULL REFERENCES semantic_entities(id),
  to_entity_id    UUID          NOT NULL REFERENCES semantic_entities(id),
  join_type       VARCHAR(50)   NOT NULL,
  join_condition  TEXT          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, from_entity_id, to_entity_id),
  CONSTRAINT chk_join_type CHECK (join_type IN ('one_to_many', 'many_to_one', 'many_to_many'))
);

-- =========================================================================
-- Task 1.2: Semantic Measures (FR-7, AC-SM-3)
-- Aggregations, formulas, and derived calculations from metric logic.
-- =========================================================================

CREATE TABLE semantic_measures (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID          NOT NULL,
  name                VARCHAR(255)  NOT NULL,
  display_name        VARCHAR(255)  NOT NULL,
  expression          TEXT          NOT NULL,
  measure_type        VARCHAR(50)   NOT NULL,
  entity_id           UUID          NOT NULL REFERENCES semantic_entities(id),
  dependent_measures  JSONB         NOT NULL DEFAULT '[]'::jsonb,
  source_report_ids   JSONB         NOT NULL DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, name),
  CONSTRAINT chk_measure_type CHECK (measure_type IN ('base', 'derived'))
);

CREATE INDEX idx_measures_tenant_name
  ON semantic_measures (tenant_id, name);

-- =========================================================================
-- Task 2: Schema Versions (FR-10, FR-11)
-- Versioned snapshots of the full semantic layer schema.
-- =========================================================================

CREATE TABLE schema_versions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID          NOT NULL,
  version             VARCHAR(20)   NOT NULL,
  snapshot            JSONB         NOT NULL,
  diff_from_prior     JSONB,
  source_reports      JSONB         NOT NULL DEFAULT '[]'::jsonb,
  agent_model_version VARCHAR(100)  NOT NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, version)
);

CREATE INDEX idx_versions_tenant_version
  ON schema_versions (tenant_id, version);

-- =========================================================================
-- Task 2: Audit Log (FR-14, NFR-3)
-- Append-only record of every semantic layer mutation.
-- =========================================================================

CREATE TABLE scan_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID          NOT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'pending',
  reports_scanned   INT           NOT NULL DEFAULT 0,
  changes_detected  INT           NOT NULL DEFAULT 0,
  conflicts_flagged INT           NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,

  CONSTRAINT chk_scan_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

CREATE TABLE audit_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID          NOT NULL,
  schema_version_id       UUID          NOT NULL REFERENCES schema_versions(id),
  action                  VARCHAR(50)   NOT NULL,
  target_type             VARCHAR(50)   NOT NULL,
  target_id               UUID          NOT NULL,
  before_state            JSONB,
  after_state             JSONB         NOT NULL,
  triggered_by_report_id  UUID          NOT NULL,
  scan_run_id             UUID          NOT NULL REFERENCES scan_runs(id),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT chk_audit_action CHECK (action IN ('create', 'update', 'conflict_flagged', 'conflict_resolved')),
  CONSTRAINT chk_target_type CHECK (target_type IN ('entity', 'relationship', 'measure'))
);

CREATE INDEX idx_audit_tenant_created
  ON audit_log (tenant_id, created_at DESC);

CREATE INDEX idx_audit_scan_run
  ON audit_log (scan_run_id);

-- =========================================================================
-- Task 3: Chain Traces (FR-3, AC-PC-1)
-- Intermediate artifacts from the four-step prompt chain.
-- =========================================================================

CREATE TABLE chain_traces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_run_id   UUID          NOT NULL REFERENCES scan_runs(id),
  report_id     UUID          NOT NULL,
  step_number   INT           NOT NULL,
  step_name     VARCHAR(50)   NOT NULL,
  input_hash    VARCHAR(64)   NOT NULL,
  output        JSONB         NOT NULL DEFAULT '{}'::jsonb,
  status        VARCHAR(20)   NOT NULL,
  duration_ms   INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT chk_step_number CHECK (step_number BETWEEN 1 AND 4),
  CONSTRAINT chk_step_name CHECK (step_name IN ('parse', 'map', 'generate', 'validate')),
  CONSTRAINT chk_trace_status CHECK (status IN ('success', 'failed', 'ambiguous'))
);

CREATE INDEX idx_traces_run_step
  ON chain_traces (scan_run_id, step_number);

-- =========================================================================
-- Task 3: Conflicts (RM-4, RM-5, RM-6, AC-DP-2, AC-DP-3)
-- Tracks cases where two reports define the same metric differently.
-- =========================================================================

CREATE TABLE conflicts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL,
  metric_name     VARCHAR(255)  NOT NULL,
  report_a_id     UUID          NOT NULL,
  report_a_logic  TEXT          NOT NULL,
  report_b_id     UUID          NOT NULL,
  report_b_logic  TEXT          NOT NULL,
  diff            JSONB         NOT NULL DEFAULT '{}'::jsonb,
  status          VARCHAR(20)   NOT NULL DEFAULT 'open',
  resolved_by     UUID,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT chk_conflict_status CHECK (status IN ('open', 'resolved', 'dismissed'))
);

CREATE INDEX idx_conflicts_tenant_status
  ON conflicts (tenant_id, status);

COMMIT;
