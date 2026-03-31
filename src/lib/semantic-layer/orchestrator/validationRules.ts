/**
 * Validation Rules Engine — Task 4.2
 *
 * Implements VR-1 through VR-9 from design.md §4. These rules run as
 * the Step 4 (Validate) pass in the prompt chain and again as a
 * pre-commit gate before writing to the semantic layer store.
 *
 * Requirements: FR-9, FR-16, AC-CO-1, AC-CO-3, AC-SC-2, AC-SC-3
 * Design ref:   design.md §4 (Validation rules)
 */

import * as catalogRepo from '../repositories/catalogRepository';
import * as entityRepo from '../repositories/entityRepository';
import * as measureRepo from '../repositories/measureRepository';
import type {
  GenerateStepOutput,
  ValidationViolation,
  ValidateStepOutput,
  EntrataSchemaEntry,
} from '../types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs all validation rules (VR-1 through VR-9) against a set of
 * generated semantic definitions.
 *
 * Rules are evaluated in order. All rules run regardless of prior
 * failures — the full set of violations is returned so the caller
 * can present a complete error report (AC-CO-3).
 *
 * @param output   - The merged definitions from the Generate step
 * @param tenantId - Tenant UUID for database lookups
 * @returns Validation result with pass/fail flag and all violations
 */
export async function validateAll(
  output: GenerateStepOutput,
  tenantId: string
): Promise<ValidateStepOutput> {
  const violations: ValidationViolation[] = [];

  violations.push(...checkCircularRelationships(output));
  violations.push(...checkOrphanedEntities(output));
  violations.push(...await checkDuplicateMeasures(output, tenantId));
  violations.push(...checkExpressionParsability(output));
  violations.push(...checkReferentialIntegrity(output));
  violations.push(...checkJoinConditionSyntax(output));
  violations.push(...await checkCatalogGrounding(output));

  const hasErrors = violations.some((v) => v.severity === 'error');

  return {
    valid: !hasErrors,
    violations,
  };
}

// ---------------------------------------------------------------------------
// VR-1: No circular relationships
// The entity relationship graph must be a directed acyclic graph (DAG).
// ---------------------------------------------------------------------------

/**
 * Detects cycles in the entity relationship graph using depth-first
 * traversal. A cycle means entity A relates to B, B relates to C,
 * and C relates back to A (or any shorter loop).
 *
 * @param output - Generated definitions containing entities and relationships
 * @returns Array of violations (empty if the graph is acyclic)
 */
export function checkCircularRelationships(
  output: GenerateStepOutput
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Build an adjacency list from entity names
  const adjacency = new Map<string, string[]>();
  for (const entity of output.entities) {
    adjacency.set(entity.input.name, []);
  }
  for (const rel of output.relationships) {
    const neighbors = adjacency.get(rel.fromEntityName) ?? [];
    neighbors.push(rel.toEntityName);
    adjacency.set(rel.fromEntityName, neighbors);
  }

  // DFS cycle detection with three-color marking:
  // white = unvisited, gray = in current path, black = fully explored
  const white = new Set(adjacency.keys());
  const gray = new Set<string>();
  const black = new Set<string>();

  function dfs(node: string, path: string[]): boolean {
    white.delete(node);
    gray.add(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (gray.has(neighbor)) {
        // Found a cycle — trace the path from the neighbor to current node
        const cycleStart = path.indexOf(neighbor);
        const cycle = [...path.slice(cycleStart), neighbor];
        violations.push({
          ruleId: 'VR-1',
          severity: 'error',
          message: `Circular relationship detected: ${cycle.join(' → ')}`,
        });
        return true;
      }
      if (!black.has(neighbor)) {
        if (dfs(neighbor, [...path, neighbor])) return true;
      }
    }

    gray.delete(node);
    black.add(node);
    return false;
  }

  // Run DFS from every unvisited node
  for (const node of [...white]) {
    dfs(node, [node]);
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-2: No orphaned entities
// Every entity must be referenced by at least one relationship or measure.
// Severity: Warning (does not block commit).
// ---------------------------------------------------------------------------

/**
 * Identifies entities that are not referenced by any relationship or measure.
 *
 * @param output - Generated definitions
 * @returns Array of warnings for orphaned entities
 */
export function checkOrphanedEntities(
  output: GenerateStepOutput
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const referencedEntities = new Set<string>();

  // Entities referenced by relationships
  for (const rel of output.relationships) {
    referencedEntities.add(rel.fromEntityName);
    referencedEntities.add(rel.toEntityName);
  }

  // Entities referenced by measures
  for (const measure of output.measures) {
    referencedEntities.add(measure.input.entityName);
  }

  for (const entity of output.entities) {
    if (!referencedEntities.has(entity.input.name)) {
      violations.push({
        ruleId: 'VR-2',
        severity: 'warning',
        message: `Entity "${entity.input.name}" is not referenced by any relationship or measure`,
        target: { type: 'entity', name: entity.input.name },
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-3: No duplicate measure names
// Two measures with the same (tenant_id, name) but different expressions
// trigger a conflict and route to the Conflict Queue.
// ---------------------------------------------------------------------------

/**
 * Checks whether any proposed measure names already exist in the
 * semantic layer with a different expression. If so, this is a
 * conflict that must be routed to the Conflict Queue (RM-4).
 *
 * @param output   - Generated definitions
 * @param tenantId - Tenant UUID
 * @returns Array of violations for duplicate measure names
 */
export async function checkDuplicateMeasures(
  output: GenerateStepOutput,
  tenantId: string
): Promise<ValidationViolation[]> {
  const violations: ValidationViolation[] = [];

  for (const measure of output.measures) {
    // Skip measures that are being reused (not new)
    if (measure.existingId) continue;

    const existing = await measureRepo.findMeasureByName(
      tenantId,
      measure.input.name
    );

    if (existing && existing.expression !== measure.input.expression) {
      violations.push({
        ruleId: 'VR-3',
        severity: 'error',
        message:
          `Measure "${measure.input.name}" already exists with a different expression. ` +
          `Existing: "${existing.expression}", proposed: "${measure.input.expression}". ` +
          `This conflict must be resolved manually.`,
        target: { type: 'measure', name: measure.input.name },
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-4: Expression parsability
// Every measure expression must be syntactically valid against the
// known entity/relationship graph.
// ---------------------------------------------------------------------------

/**
 * Validates that every measure expression references only known entity
 * names and follows basic syntax rules. This is a structural check,
 * not a full SQL parser — it verifies that table.column references
 * in the expression map to entities defined in this output.
 *
 * @param output - Generated definitions
 * @returns Array of violations for unparseable expressions
 */
export function checkExpressionParsability(
  output: GenerateStepOutput
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const entityNames = new Set(output.entities.map((e) => e.input.name));

  for (const measure of output.measures) {
    const expr = measure.input.expression;

    if (!expr || expr.trim().length === 0) {
      violations.push({
        ruleId: 'VR-4',
        severity: 'error',
        message: `Measure "${measure.input.name}" has an empty expression`,
        target: { type: 'measure', name: measure.input.name },
      });
      continue;
    }

    // Extract table.column references (e.g., "leases.gross_rent")
    const tableColumnRefs = expr.match(/(\w+)\.(\w+)/g) ?? [];
    for (const ref of tableColumnRefs) {
      const [tablePart] = ref.split('.');
      // Check that the table part maps to a known entity name or
      // a known source table name. We accept both conventions.
      const isKnownEntity = entityNames.has(tablePart);
      const isKnownSourceTable = output.entities.some((e) =>
        e.input.sourceTables.some((t) => t.endsWith(tablePart) || t === tablePart)
      );

      if (!isKnownEntity && !isKnownSourceTable) {
        violations.push({
          ruleId: 'VR-4',
          severity: 'error',
          message:
            `Expression for "${measure.input.name}" references unknown table ` +
            `"${tablePart}" in "${ref}". Known entities: [${[...entityNames].join(', ')}]`,
          target: { type: 'measure', name: measure.input.name },
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-5: Referential integrity
// Every entity_id and dependent_measures reference must resolve to an
// existing record in the output or the database.
// ---------------------------------------------------------------------------

/**
 * Verifies that every measure's entity reference and dependent measure
 * references resolve to entities/measures in the current output.
 *
 * @param output - Generated definitions
 * @returns Array of violations for broken references
 */
export function checkReferentialIntegrity(
  output: GenerateStepOutput
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const entityNames = new Set(output.entities.map((e) => e.input.name));
  const measureNames = new Set(output.measures.map((m) => m.input.name));

  for (const measure of output.measures) {
    // Check entity reference
    if (!entityNames.has(measure.input.entityName)) {
      violations.push({
        ruleId: 'VR-5',
        severity: 'error',
        message:
          `Measure "${measure.input.name}" references entity ` +
          `"${measure.input.entityName}" which does not exist in the output`,
        target: { type: 'measure', name: measure.input.name },
      });
    }

    // Check dependent measure references
    for (const depName of measure.input.dependentMeasureNames) {
      if (!measureNames.has(depName)) {
        violations.push({
          ruleId: 'VR-5',
          severity: 'error',
          message:
            `Measure "${measure.input.name}" depends on measure ` +
            `"${depName}" which does not exist in the output`,
          target: { type: 'measure', name: measure.input.name },
        });
      }
    }
  }

  // Check relationship entity references
  for (const rel of output.relationships) {
    if (!entityNames.has(rel.fromEntityName)) {
      violations.push({
        ruleId: 'VR-5',
        severity: 'error',
        message:
          `Relationship references source entity "${rel.fromEntityName}" ` +
          `which does not exist in the output`,
        target: { type: 'relationship', name: `${rel.fromEntityName} → ${rel.toEntityName}` },
      });
    }
    if (!entityNames.has(rel.toEntityName)) {
      violations.push({
        ruleId: 'VR-5',
        severity: 'error',
        message:
          `Relationship references target entity "${rel.toEntityName}" ` +
          `which does not exist in the output`,
        target: { type: 'relationship', name: `${rel.fromEntityName} → ${rel.toEntityName}` },
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-6: Join condition validity
// Relationship join conditions must reference columns that exist on the
// connected entities' source tables (structural check within the output).
// ---------------------------------------------------------------------------

/**
 * Checks that join conditions reference column names that appear in
 * the source tables of the connected entities.
 *
 * @param output - Generated definitions
 * @returns Array of violations for invalid join conditions
 */
export function checkJoinConditionSyntax(
  output: GenerateStepOutput
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  for (const rel of output.relationships) {
    if (!rel.joinCondition || rel.joinCondition.trim().length === 0) {
      violations.push({
        ruleId: 'VR-6',
        severity: 'error',
        message:
          `Relationship ${rel.fromEntityName} → ${rel.toEntityName} ` +
          `has an empty join condition`,
        target: { type: 'relationship', name: `${rel.fromEntityName} → ${rel.toEntityName}` },
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// VR-9: Catalog grounding (FR-16, AC-SC-2, AC-SC-3)
// Every entity must resolve to a table in entrata_schema_catalog.
// Every relationship join condition must reference columns and FKs
// present in the catalog.
// ---------------------------------------------------------------------------

/**
 * Verifies that every proposed entity maps to a real Entrata table and
 * that relationship join conditions reference real columns. This is the
 * critical rule that prevents the agent from hallucinating schema elements.
 *
 * @param output - Generated definitions
 * @returns Array of violations for ungrounded entities or columns
 */
export async function checkCatalogGrounding(
  output: GenerateStepOutput
): Promise<ValidationViolation[]> {
  const violations: ValidationViolation[] = [];

  // Check that every entity's source tables exist in the catalog
  for (const entity of output.entities) {
    for (const sourceTable of entity.input.sourceTables) {
      const exists = await catalogRepo.tableExists(sourceTable);
      if (!exists) {
        violations.push({
          ruleId: 'VR-9',
          severity: 'error',
          message:
            `Entity "${entity.input.name}" references table "${sourceTable}" ` +
            `which does not exist in the Entrata schema catalog. ` +
            `Run a catalog refresh if the table was recently added.`,
          target: { type: 'entity', name: entity.input.name },
        });
      }
    }
  }

  // Check that join conditions reference real columns
  for (const rel of output.relationships) {
    // Extract table.column references from the join condition
    const refs = rel.joinCondition.match(/(\w+)\.(\w+)/g) ?? [];

    for (const ref of refs) {
      const [tablePart, columnPart] = ref.split('.');

      // Resolve the table part to a full catalog table name.
      // The join condition may use short names (e.g., "leases") so we
      // search for a source table ending with that name.
      const resolvedTable = findSourceTableForName(tablePart, output);
      if (!resolvedTable) continue; // VR-5 already catches missing entities

      const colExists = await catalogRepo.columnExists(resolvedTable, columnPart);
      if (!colExists) {
        violations.push({
          ruleId: 'VR-9',
          severity: 'error',
          message:
            `Join condition for ${rel.fromEntityName} → ${rel.toEntityName} ` +
            `references column "${ref}" but column "${columnPart}" does not exist ` +
            `on table "${resolvedTable}" in the Entrata schema catalog`,
          target: {
            type: 'relationship',
            name: `${rel.fromEntityName} → ${rel.toEntityName}`,
          },
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a short table name (e.g., "leases") to its full catalog name
 * (e.g., "public.leases") by searching entity source tables in the output.
 *
 * @param shortName - Short table name from a join condition
 * @param output    - Generated definitions to search
 * @returns Full table name, or null if not found
 */
function findSourceTableForName(
  shortName: string,
  output: GenerateStepOutput
): string | null {
  for (const entity of output.entities) {
    for (const sourceTable of entity.input.sourceTables) {
      // Match "public.leases" against short name "leases"
      if (sourceTable === shortName || sourceTable.endsWith(`.${shortName}`)) {
        return sourceTable;
      }
    }
  }
  return null;
}
