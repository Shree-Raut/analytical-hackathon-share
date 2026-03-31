/**
 * AI-Managed Semantic Data Layer — Type Definitions
 *
 * All types mirror the data model in design.md §3.1 exactly.
 * Requirement references are noted per type.
 */

// ---------------------------------------------------------------------------
// Entrata Schema Catalog (FR-15, FR-16, FR-17, AC-SC-1..AC-SC-4)
// ---------------------------------------------------------------------------

/**
 * A single column entry in the Entrata schema catalog.
 * Represents one column from the Entrata production database, used as
 * "ground truth" for the agent's Map and Validate steps.
 */
export interface EntrataSchemaEntry {
  id: string;
  tableName: string;
  columnName: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  /** Target table if this column is a foreign key; null otherwise. */
  fkTargetTable: string | null;
  /** Target column if this column is a foreign key; null otherwise. */
  fkTargetColumn: string | null;
  isNullable: boolean;
  refreshedAt: Date;
}

/**
 * Input shape for upserting catalog entries during a refresh.
 * Omits `id` and `refreshedAt` — those are set server-side.
 */
export type EntrataSchemaEntryInput = Omit<EntrataSchemaEntry, 'id' | 'refreshedAt'>;

/**
 * Summary returned after a catalog refresh completes.
 */
export interface CatalogRefreshResult {
  tablesAdded: number;
  tablesRemoved: number;
  columnsUpserted: number;
  columnsRemoved: number;
  refreshedAt: Date;
}

// ---------------------------------------------------------------------------
// Semantic Entities (FR-5, AC-SM-1, NFR-5)
// ---------------------------------------------------------------------------

/**
 * A domain entity extracted from report metric logic and grounded
 * against the Entrata schema catalog. Maps to one or more database tables.
 */
export interface SemanticEntity {
  id: string;
  tenantId: string;
  /** Unique entity name within a tenant (e.g., "unit", "lease"). */
  name: string;
  description: string;
  /** Array of Entrata table names this entity maps to. */
  sourceTables: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new semantic entity. Omits server-generated fields.
 */
export type SemanticEntityInput = Omit<SemanticEntity, 'id' | 'createdAt' | 'updatedAt'>;

// ---------------------------------------------------------------------------
// Semantic Relationships (FR-6, AC-SM-2)
// ---------------------------------------------------------------------------

/** Allowed join cardinality types. */
export type JoinType = 'one_to_many' | 'many_to_one' | 'many_to_many';

/**
 * A relationship between two semantic entities, representing a join path
 * required to compute a metric. Grounded against catalog foreign keys.
 */
export interface SemanticRelationship {
  id: string;
  tenantId: string;
  fromEntityId: string;
  toEntityId: string;
  joinType: JoinType;
  /** SQL join predicate (e.g., "leases.unit_id = units.id"). */
  joinCondition: string;
  createdAt: Date;
}

/**
 * Input for creating or upserting a relationship. Omits server-generated fields.
 */
export type SemanticRelationshipInput = Omit<SemanticRelationship, 'id' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Semantic Measures (FR-7, AC-SM-3)
// ---------------------------------------------------------------------------

/** A measure is either a base aggregation or a derived calculation. */
export type MeasureType = 'base' | 'derived';

/**
 * A measure extracted from report metric logic: either a base aggregation
 * (e.g., gross_rent) or a derived calculation (e.g., net_effective_rent).
 */
export interface SemanticMeasure {
  id: string;
  tenantId: string;
  /** Machine-readable name (e.g., "net_effective_rent"). */
  name: string;
  /** Human-readable display name (e.g., "Net Effective Rent"). */
  displayName: string;
  /** The canonical formula or SQL expression. */
  expression: string;
  measureType: MeasureType;
  /** Primary entity this measure belongs to. FK → semantic_entities. */
  entityId: string;
  /** IDs of measures this one derives from (empty for base measures). */
  dependentMeasures: string[];
  /** IDs of reports that contributed this measure definition. */
  sourceReportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new semantic measure. Omits server-generated fields.
 */
export type SemanticMeasureInput = Omit<SemanticMeasure, 'id' | 'createdAt' | 'updatedAt'>;

// ---------------------------------------------------------------------------
// Schema Versions (FR-10, FR-11)
// ---------------------------------------------------------------------------

/**
 * A versioned snapshot of the full semantic layer schema.
 * Each mutation produces a new version with a diff from the prior state.
 */
export interface SchemaVersion {
  id: string;
  tenantId: string;
  /** Semver string (e.g., "1.4.0"). */
  version: string;
  /** Full schema at this version. */
  snapshot: Record<string, unknown>;
  /** Change set from the previous version. */
  diffFromPrior: Record<string, unknown> | null;
  /** Report IDs processed in this version. */
  sourceReports: string[];
  /** LLM model identifier used by the agent. */
  agentModelVersion: string;
  createdAt: Date;
}

/**
 * Input for publishing a new schema version. Omits server-generated fields.
 */
export type SchemaVersionInput = Omit<SchemaVersion, 'id' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Audit Log (FR-14, NFR-3)
// ---------------------------------------------------------------------------

/** Actions that can appear in the audit log. */
export type AuditAction = 'create' | 'update' | 'conflict_flagged' | 'conflict_resolved';

/** Target types that audit entries can reference. */
export type AuditTargetType = 'entity' | 'relationship' | 'measure';

/**
 * An append-only audit log entry tracking every semantic layer mutation.
 * Enables full traceability from a schema change back to the triggering
 * report and scan run (NFR-3).
 */
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  schemaVersionId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  /** Previous definition; null on create. */
  beforeState: Record<string, unknown> | null;
  /** New definition after the mutation. */
  afterState: Record<string, unknown>;
  /** Report whose change triggered this mutation. */
  triggeredByReportId: string;
  scanRunId: string;
  createdAt: Date;
}

/**
 * Input for appending an audit log entry. Omits server-generated fields.
 */
export type AuditLogEntryInput = Omit<AuditLogEntry, 'id' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Scan Runs (FR-12, FR-13, NFR-3)
// ---------------------------------------------------------------------------

/** Status lifecycle for a scan run. */
export type ScanRunStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * A single execution of the scan scheduler. Tracks how many reports
 * were scanned, how many had changes, and how many conflicts were flagged.
 */
export interface ScanRun {
  id: string;
  tenantId: string;
  status: ScanRunStatus;
  reportsScanned: number;
  changesDetected: number;
  conflictsFlagged: number;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * Input for creating a new scan run.
 */
export type ScanRunInput = Pick<ScanRun, 'tenantId'>;

// ---------------------------------------------------------------------------
// Chain Traces (FR-3, AC-PC-1)
// ---------------------------------------------------------------------------

/** Status of an individual prompt chain step. */
export type ChainTraceStatus = 'success' | 'failed' | 'ambiguous';

/** The four prompt chain steps defined in design.md §2. */
export type ChainStepName = 'parse' | 'map' | 'generate' | 'validate';

/**
 * An intermediate artifact produced by one step of the prompt chain.
 * Stored for step-level debugging and failure diagnosis (FR-3).
 */
export interface ChainTrace {
  id: string;
  scanRunId: string;
  reportId: string;
  /** 1-based step number (1 = parse, 2 = map, 3 = generate, 4 = validate). */
  stepNumber: number;
  stepName: ChainStepName;
  /** SHA-256 hash of the step's input for idempotency checks. */
  inputHash: string;
  /** The step's output artifact (JSON). */
  output: Record<string, unknown>;
  status: ChainTraceStatus;
  /** Execution time in milliseconds. */
  durationMs: number;
  createdAt: Date;
}

/**
 * Input for appending a chain trace. Omits server-generated fields.
 */
export type ChainTraceInput = Omit<ChainTrace, 'id' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Conflicts (RM-4, RM-5, RM-6, AC-DP-2, AC-DP-3)
// ---------------------------------------------------------------------------

/** Status lifecycle for a metric conflict. */
export type ConflictStatus = 'open' | 'resolved' | 'dismissed';

/** How a conflict was resolved. */
export type ConflictResolution = 'accept_a' | 'accept_b' | 'custom';

/**
 * A conflict flagged when two reports define the same metric name
 * with differing logic. The metric is frozen at its last-approved
 * version until a human resolves the conflict (RM-6).
 */
export interface Conflict {
  id: string;
  tenantId: string;
  metricName: string;
  reportAId: string;
  reportALogic: string;
  reportBId: string;
  reportBLogic: string;
  /** Structured side-by-side comparison of the two definitions. */
  diff: Record<string, unknown>;
  status: ConflictStatus;
  /** User who resolved the conflict; null while open. */
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

/**
 * Input for creating a new conflict record.
 */
export type ConflictInput = Omit<Conflict, 'id' | 'status' | 'resolvedBy' | 'resolvedAt' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Orchestrator types (FR-1, FR-2, FR-3, FR-4, FR-15, AC-PC-1..AC-PC-3)
// ---------------------------------------------------------------------------

/** The type of metric logic being ingested. */
export type LogicType = 'sql' | 'formula';

/**
 * Input to the prompt chain orchestrator. Contains everything needed
 * to process a single report's metric logic.
 */
export interface OrchestratorInput {
  tenantId: string;
  reportId: string;
  /** Raw metric logic — either a SQL query or a formula expression. */
  logic: string;
  logicType: LogicType;
  /** Scan run this processing belongs to. */
  scanRunId: string;
}

/**
 * Output of Step 1 (Parse): a tokenized/decomposed representation
 * of the raw metric logic.
 */
export interface ParseStepOutput {
  /** Original logic string. */
  rawLogic: string;
  logicType: LogicType;
  /** Extracted tokens: table references, column references, operators, literals. */
  tokens: Array<{
    type: 'table_ref' | 'column_ref' | 'operator' | 'literal' | 'function' | 'alias';
    value: string;
    /** Source table for column refs, if identifiable. */
    table?: string;
  }>;
  /** Table names referenced in the logic. */
  referencedTables: string[];
  /** Column names referenced in the logic, grouped by table. */
  referencedColumns: Record<string, string[]>;
}

/**
 * A candidate entity proposed by Step 2 (Map) before deduplication.
 */
export interface CandidateEntity {
  name: string;
  description: string;
  sourceTables: string[];
}

/**
 * A candidate relationship proposed by Step 2 (Map).
 */
export interface CandidateRelationship {
  fromEntityName: string;
  toEntityName: string;
  joinType: JoinType;
  joinCondition: string;
}

/**
 * A candidate measure proposed by Step 2 (Map).
 */
export interface CandidateMeasure {
  name: string;
  displayName: string;
  expression: string;
  measureType: MeasureType;
  /** Name of the primary entity (resolved to ID in Step 3). */
  entityName: string;
  /** Names of measures this one depends on (resolved to IDs in Step 3). */
  dependentMeasureNames: string[];
}

/**
 * Output of Step 2 (Map): candidate semantic components grounded
 * against the Entrata schema catalog.
 */
export interface MapStepOutput {
  entities: CandidateEntity[];
  relationships: CandidateRelationship[];
  measures: CandidateMeasure[];
}

/**
 * Output of Step 3 (Generate): merged definitions ready for validation.
 * Entity/relationship/measure names are resolved to IDs where they
 * already exist in the layer (FR-8 deduplication).
 */
export interface GenerateStepOutput {
  entities: Array<{
    /** Null if new; populated if reusing an existing entity. */
    existingId: string | null;
    input: CandidateEntity;
  }>;
  relationships: Array<{
    fromEntityName: string;
    toEntityName: string;
    joinType: JoinType;
    joinCondition: string;
  }>;
  measures: Array<{
    /** Null if new; populated if reusing an existing measure. */
    existingId: string | null;
    input: CandidateMeasure;
  }>;
  /** Report ID that sourced this data. */
  sourceReportId: string;
}

// ---------------------------------------------------------------------------
// Validation types (FR-9, AC-CO-1..AC-CO-3, VR-1..VR-9)
// ---------------------------------------------------------------------------

/** Severity of a validation violation. */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation violation found during the Step 4 (Validate) pass.
 */
export interface ValidationViolation {
  /** Validation rule ID (e.g., "VR-1", "VR-9"). */
  ruleId: string;
  severity: ValidationSeverity;
  message: string;
  /** The specific entity, relationship, or measure that violated the rule. */
  target?: {
    type: 'entity' | 'relationship' | 'measure';
    name: string;
  };
}

/**
 * Output of Step 4 (Validate): the overall result plus any violations.
 */
export interface ValidateStepOutput {
  valid: boolean;
  violations: ValidationViolation[];
}

/**
 * Final result of the orchestrator for a single report.
 */
export interface OrchestratorResult {
  scanRunId: string;
  reportId: string;
  /** Whether the chain completed successfully through all four steps. */
  success: boolean;
  /** Step at which processing halted (null if all steps succeeded). */
  failedAtStep: ChainStepName | null;
  /** True if skipped due to idempotency (VR-8). */
  skipped: boolean;
  /** Validation violations (empty if validation passed or was not reached). */
  violations: ValidationViolation[];
  /** Generated output available when chain completed (used by conflict detector). */
  generatedOutput?: GenerateStepOutput;
}

// ---------------------------------------------------------------------------
// Report Sources (FR-1, FR-12, FR-13, NFR-4)
// ---------------------------------------------------------------------------

/**
 * A registered report source that the scan scheduler monitors.
 * The adapter layer reads the current metric logic from each source
 * and feeds it to the orchestrator when changes are detected.
 */
export interface ReportSource {
  id: string;
  tenantId: string;
  /** Human-readable name (e.g., "Rent Roll Summary Report"). */
  name: string;
  logicType: LogicType;
  /** Current metric logic (SQL or formula). Read from the report system. */
  currentLogic: string;
}

/**
 * Adapter interface for fetching report sources.
 * Implementations can read from a database, file system, or API.
 * New source types (dbt, BI tools) plug in here (NFR-4).
 */
export interface ReportSourceAdapter {
  /**
   * Returns all registered report sources for a tenant.
   *
   * @param tenantId - Tenant UUID
   * @returns Array of report sources with their current logic
   */
  listSources(tenantId: string): Promise<ReportSource[]>;
}

// ---------------------------------------------------------------------------
// Conflict Detection (RM-4, RM-5, RM-6, AC-DP-2, AC-DP-3)
// ---------------------------------------------------------------------------

/**
 * Result of running the conflict detector against a set of generated
 * definitions. Contains any conflicts that were created and any
 * measures that were frozen.
 */
export interface ConflictDetectionResult {
  /** Number of new conflicts created. */
  conflictsCreated: number;
  /** Metric names that were frozen due to conflicts (RM-6). */
  frozenMetrics: string[];
  /** Notifications dispatched (metric name + channel). */
  notificationsSent: Array<{
    metricName: string;
    channel: string;
  }>;
}

// ---------------------------------------------------------------------------
// Scan Scheduler (FR-12, FR-13, RM-1, RM-2, AC-CU-1, AC-CU-2)
// ---------------------------------------------------------------------------

/**
 * Configuration for the scan scheduler.
 */
export interface ScanSchedulerConfig {
  /** Cron expression or polling interval in milliseconds. */
  intervalMs: number;
  /** Whether to process reports concurrently or sequentially. */
  concurrent: boolean;
}

/**
 * Result of a single scan execution.
 */
export interface ScanResult {
  scanRunId: string;
  tenantId: string;
  reportsScanned: number;
  changesDetected: number;
  conflictsFlagged: number;
  /** Per-report outcomes. */
  reportResults: Array<{
    reportId: string;
    skipped: boolean;
    success: boolean;
    conflictsCreated: number;
  }>;
}

// ---------------------------------------------------------------------------
// Notification (AC-DP-3)
// ---------------------------------------------------------------------------

/**
 * A notification payload dispatched when a conflict is detected.
 * Includes the metric name, conflicting report sources, and a
 * side-by-side diff of the definitions (AC-DP-3).
 */
export interface ConflictNotification {
  tenantId: string;
  metricName: string;
  reportAId: string;
  reportALogic: string;
  reportBId: string;
  reportBLogic: string;
  diff: Record<string, unknown>;
}

/**
 * Notification channel interface. Implementations deliver conflict
 * notifications via Slack, email, or in-app. Task 5 uses a stub;
 * the real adapter is swapped in once the channel is decided
 * (design.md §9, open question #2).
 */
export interface NotificationChannel {
  /** Channel identifier (e.g., "slack", "email", "stub"). */
  readonly channelName: string;

  /**
   * Dispatches a conflict notification.
   *
   * @param notification - The conflict details to send
   * @returns true if delivery succeeded
   */
  send(notification: ConflictNotification): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// API Layer (design.md §5)
// ---------------------------------------------------------------------------

/**
 * Pagination metadata returned with every list endpoint response
 * (design.md §5.3).
 */
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
}

/**
 * Standard paginated list response shape.
 * All list endpoints return `{ data: T[], meta: PaginationMeta }`.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * RFC 7807 Problem Details response shape for error responses
 * (design.md §5.3).
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  violations?: ValidationViolation[];
}

/**
 * Request body for POST /api/v1/admin/semantic/ingest (design.md §5.2).
 */
export interface IngestRequestBody {
  report_id: string;
  logic: string;
  logic_type: LogicType;
}

/**
 * Request body for POST /api/v1/admin/semantic/conflicts/:id/resolve
 * (design.md §5.2).
 */
export interface ResolveConflictRequestBody {
  resolution: ConflictResolution;
  custom_logic?: string;
  user_id: string;
}
