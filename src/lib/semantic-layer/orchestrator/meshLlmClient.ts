import type {
  EntrataSchemaEntry,
  GenerateStepOutput,
  MapStepOutput,
  ParseStepOutput,
} from "@/lib/semantic-layer/types";
import type { ExistingLayerSnapshot, LlmClient } from "@/lib/semantic-layer/orchestrator/llmClient";
import { callLlm, getLlmConfig, hasLlmApiKey, parseJsonResponse } from "@/lib/llm-client";

function extractTokens(logic: string): ParseStepOutput["tokens"] {
  const tokenSet = new Set<string>();
  const tableRefs = logic.match(/\bfrom\s+([a-zA-Z0-9_\.]+)/gi) ?? [];
  const joinRefs = logic.match(/\bjoin\s+([a-zA-Z0-9_\.]+)/gi) ?? [];
  for (const ref of [...tableRefs, ...joinRefs]) tokenSet.add(ref.split(/\s+/)[1]);
  const columnRefs = logic.match(/[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
  const tokens: ParseStepOutput["tokens"] = [];
  for (const table of tokenSet) tokens.push({ type: "table_ref", value: table });
  for (const col of columnRefs) {
    const [table, column] = col.split(".");
    tokens.push({ type: "column_ref", value: column, table });
  }
  return tokens;
}

export class MeshLlmClient implements LlmClient {
  readonly modelVersion: string;
  private readonly llmConfig = getLlmConfig({
    modelEnvOrder: ["LITELLM_MODEL", "MESH_MODEL_ID", "OPENAI_MODEL"],
  });

  constructor() {
    this.modelVersion = this.llmConfig.model;
  }

  async parse(logic: string, logicType: "sql" | "formula"): Promise<ParseStepOutput> {
    if (!hasLlmApiKey()) {
      const tokens = extractTokens(logic);
      const referencedTables = tokens
        .filter((token) => token.type === "table_ref")
        .map((token) => token.value);
      const referencedColumns: Record<string, string[]> = {};
      for (const token of tokens) {
        if (token.type === "column_ref" && token.table) {
          referencedColumns[token.table] = referencedColumns[token.table] || [];
          referencedColumns[token.table].push(token.value);
        }
      }
      return { rawLogic: logic, logicType, tokens, referencedTables, referencedColumns };
    }

    const response = await callLlm(
      `Parse this ${logicType} into JSON with keys rawLogic, logicType, tokens, referencedTables, referencedColumns.\nLogic:\n${logic}`,
      { config: this.llmConfig, temperature: 0 },
    );
    const parsed = response ? parseJsonResponse<ParseStepOutput>(response.text) : null;
    if (parsed) return parsed;
    return this.parse(logic, logicType);
  }

  async map(
    parseOutput: ParseStepOutput,
    catalog: EntrataSchemaEntry[],
  ): Promise<MapStepOutput> {
    const candidateTables = parseOutput.referencedTables.length
      ? parseOutput.referencedTables
      : [...new Set(catalog.slice(0, 10).map((entry) => entry.tableName))];
    const entities = candidateTables.slice(0, 5).map((table) => ({
      name: table.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase(),
      description: `Entity inferred from table ${table}`,
      sourceTables: [table],
    }));
    const relationships = entities.length > 1
      ? [
          {
            fromEntityName: entities[0].name,
            toEntityName: entities[1].name,
            joinType: "one_to_many" as const,
            joinCondition: `${entities[0].sourceTables[0]}.id = ${entities[1].sourceTables[0]}.${entities[0].name}_id`,
          },
        ]
      : [];
    const measures = [
      {
        name: "ingested_metric",
        displayName: "Ingested Metric",
        expression: parseOutput.rawLogic,
        measureType: "derived" as const,
        entityName: entities[0]?.name ?? "metric",
        dependentMeasureNames: [],
      },
    ];
    return { entities, relationships, measures };
  }

  async generate(
    mapOutput: MapStepOutput,
    existingLayer: ExistingLayerSnapshot,
    _catalog: EntrataSchemaEntry[],
    sourceReportId: string,
  ): Promise<GenerateStepOutput> {
    return {
      entities: mapOutput.entities.map((entity) => ({
        existingId:
          existingLayer.entities.find((current) => current.name === entity.name)?.id ??
          null,
        input: entity,
      })),
      relationships: mapOutput.relationships,
      measures: mapOutput.measures.map((measure) => ({
        existingId:
          existingLayer.measures.find((current) => current.name === measure.name)?.id ??
          null,
        input: measure,
      })),
      sourceReportId,
    };
  }
}
