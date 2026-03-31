/**
 * Conflict Detector — Task 5
 *
 * Post-validation step that compares newly generated semantic definitions
 * against the existing layer. When a measure name already exists but comes
 * from a different report with different logic, the detector:
 *
 *   1. Creates a `conflicts` record in "open" status (RM-4)
 *   2. Freezes the metric at its last-approved version (RM-6 — the metric
 *      is NOT updated; the conflict must be resolved by a human first)
 *   3. Dispatches a notification (Slack/email stub) with the metric name,
 *      both report sources, and a diff of the two definitions (RM-5, AC-DP-3)
 *
 * The detector runs AFTER validation passes but BEFORE any schema mutation
 * is committed. This ensures RM-3 is satisfied: no silent overwrites.
 *
 * Requirements: RM-3, RM-4, RM-5, RM-6, AC-DP-2, AC-DP-3
 * Design ref:   design.md §1 (Conflict Detector component),
 *               design.md §7.1 (Conflict detection error category)
 */

import * as measureRepo from '../repositories/measureRepository';
import * as conflictRepo from '../repositories/conflictRepository';
import type { NotificationChannel, ConflictDetectionResult, GenerateStepOutput, SemanticMeasure } from '../types';

// ---------------------------------------------------------------------------
// Conflict detection
// ---------------------------------------------------------------------------

/**
 * Compares new measure definitions against the existing semantic layer.
 *
 * For each measure in the generated output, this function checks:
 *   a) Does a measure with the same name already exist for this tenant?
 *   b) If so, was it contributed by a *different* report?
 *   c) If so, does the expression (logic) differ?
 *
 * When all three conditions are met, a conflict is flagged. The existing
 * measure is left untouched (frozen at its last-approved state per RM-6),
 * and the caller should skip persisting the conflicting definition.
 *
 * @param tenantId       - Tenant UUID for scoping
 * @param reportId       - The report currently being processed
 * @param generatedOutput - Output of Step 3 (Generate) containing new definitions
 * @param channel        - Notification channel for dispatching conflict alerts
 * @returns Summary of conflicts created, frozen metrics, and notifications sent
 */
export async function detectConflicts(
  tenantId: string,
  reportId: string,
  generatedOutput: GenerateStepOutput,
  channel: NotificationChannel
): Promise<ConflictDetectionResult> {
  const result: ConflictDetectionResult = {
    conflictsCreated: 0,
    frozenMetrics: [],
    notificationsSent: [],
  };

  for (const candidateMeasure of generatedOutput.measures) {
    const measureName = candidateMeasure.input.name;
    const newExpression = candidateMeasure.input.expression;

    // Look up existing measure by (tenant, name)
    const existing: SemanticMeasure | null = await measureRepo.findMeasureByName(
      tenantId,
      measureName
    );

    if (!existing) {
      // No existing measure with this name — no conflict possible
      continue;
    }

    // Check whether the existing measure was contributed by a different report
    const existingReportIds: string[] = Array.isArray(existing.sourceReportIds)
      ? existing.sourceReportIds
      : [];
    const isFromSameReport = existingReportIds.includes(reportId);

    if (isFromSameReport) {
      // Same report updating its own definition — this is an update, not a conflict.
      // The orchestrator handles this via normal upsert logic.
      continue;
    }

    // Different report, same metric name — check if logic actually differs
    if (existing.expression === newExpression) {
      // Identical logic from a different report — no conflict, just another
      // source that agrees on the definition. Safe to proceed.
      continue;
    }

    // ── Conflict detected ──────────────────────────────────────────────
    // Build a structured diff of the two definitions for RM-5
    const diff = buildDiff(existing, newExpression, reportId);

    // Prevent duplicate conflict records for the same metric (idempotency)
    const alreadyOpen = await conflictRepo.hasOpenConflict(tenantId, measureName);

    if (!alreadyOpen) {
      // Determine which existing report "owns" the current definition.
      // Use the first report ID in the source list as Report A.
      const existingReportId = existingReportIds[0] ?? 'unknown';

      await conflictRepo.createConflict({
        tenantId,
        metricName: measureName,
        reportAId: existingReportId,
        reportALogic: existing.expression,
        reportBId: reportId,
        reportBLogic: newExpression,
        diff,
      });

      result.conflictsCreated += 1;
    }

    // Freeze: the metric remains at its current (last-approved) version.
    // We do NOT update the measure — this is the "freeze" per RM-6.
    result.frozenMetrics.push(measureName);

    // Dispatch notification (RM-5, AC-DP-3)
    const sent = await channel.send({
      tenantId,
      metricName: measureName,
      reportAId: existingReportIds[0] ?? 'unknown',
      reportALogic: existing.expression,
      reportBId: reportId,
      reportBLogic: newExpression,
      diff,
    });

    if (sent) {
      result.notificationsSent.push({
        metricName: measureName,
        channel: channel.channelName,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Diff builder
// ---------------------------------------------------------------------------

/**
 * Builds a structured diff object comparing the existing measure logic
 * against the newly proposed logic. This is stored in the `conflicts.diff`
 * JSONB column and displayed in the Conflict Resolution Queue UI
 * (design.md §6.1, Conflict Resolution Queue).
 *
 * @param existing      - The current semantic measure
 * @param newExpression - The proposed new expression from a different report
 * @param newReportId   - The report proposing the new definition
 * @returns A structured diff suitable for JSON storage and side-by-side display
 */
function buildDiff(
  existing: SemanticMeasure,
  newExpression: string,
  newReportId: string
): Record<string, unknown> {
  return {
    metricName: existing.name,
    existing: {
      expression: existing.expression,
      measureType: existing.measureType,
      entityId: existing.entityId,
      sourceReportIds: existing.sourceReportIds,
    },
    proposed: {
      expression: newExpression,
      sourceReportId: newReportId,
    },
    expressionsDiffer: existing.expression !== newExpression,
  };
}
