/**
 * LLM Client Interface
 *
 * Defines the contract for making LLM calls in each prompt chain step.
 * The real implementation calls an LLM API (e.g., Anthropic Claude);
 * tests inject a mock. The orchestrator depends on this interface,
 * not on a concrete LLM SDK.
 *
 * Requirements: FR-2, FR-4 (determinism via temperature=0 and pinned model)
 * Design ref:   design.md §2 (Prompt chain design)
 */

import type {
  ParseStepOutput,
  MapStepOutput,
  GenerateStepOutput,
  EntrataSchemaEntry,
  SemanticEntity,
  SemanticRelationship,
  SemanticMeasure,
} from '../types';

/**
 * The existing semantic layer state passed to Steps 2 and 3 so the
 * LLM can deduplicate against what already exists.
 */
export interface ExistingLayerSnapshot {
  entities: SemanticEntity[];
  relationships: SemanticRelationship[];
  measures: SemanticMeasure[];
}

/**
 * LLM client interface. Each method corresponds to one prompt chain step.
 * Implementations must set temperature=0 and pin the model version (FR-4).
 */
export interface LlmClient {
  /** The pinned model version string (e.g., "claude-3.5-sonnet-20241022"). */
  readonly modelVersion: string;

  /**
   * Step 1 — Parse: Decompose raw metric logic into a structured AST.
   *
   * @param logic     - Raw SQL or formula string
   * @param logicType - Whether the input is "sql" or "formula"
   * @returns Parsed token breakdown with table/column references
   */
  parse(logic: string, logicType: 'sql' | 'formula'): Promise<ParseStepOutput>;

  /**
   * Step 2 — Map: Given a parsed AST and the Entrata schema catalog,
   * identify candidate entities, relationships, and measures grounded
   * against real tables and foreign keys (AC-SC-1).
   *
   * @param parseOutput - Output from Step 1
   * @param catalog     - Relevant Entrata schema catalog entries
   * @returns Candidate semantic components
   */
  map(
    parseOutput: ParseStepOutput,
    catalog: EntrataSchemaEntry[]
  ): Promise<MapStepOutput>;

  /**
   * Step 3 — Generate: Merge candidates with the existing semantic layer,
   * deduplicating entities and measures that already exist (FR-8).
   *
   * @param mapOutput       - Output from Step 2
   * @param existingLayer   - Current state of the semantic layer
   * @param catalog         - Entrata schema catalog for join validation
   * @param sourceReportId  - Report ID being processed
   * @returns Merged definitions ready for validation
   */
  generate(
    mapOutput: MapStepOutput,
    existingLayer: ExistingLayerSnapshot,
    catalog: EntrataSchemaEntry[],
    sourceReportId: string
  ): Promise<GenerateStepOutput>;
}
