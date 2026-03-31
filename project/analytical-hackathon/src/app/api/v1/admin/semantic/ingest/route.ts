import { NextRequest, NextResponse } from "next/server";
import { processReport } from "@/lib/semantic-layer/orchestrator/orchestrator";
import { MeshLlmClient } from "@/lib/semantic-layer/orchestrator/meshLlmClient";
import { detectConflicts } from "@/lib/semantic-layer/orchestrator/conflictDetector";
import { StubNotificationChannel } from "@/lib/semantic-layer/orchestrator/notificationChannel";
import { scanRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";
import type { IngestRequestBody } from "@/lib/semantic-layer/types";

export async function POST(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  const body = (await req.json()) as IngestRequestBody;
  if (!body.report_id || !body.logic || !body.logic_type) {
    return NextResponse.json(
      { error: "report_id, logic and logic_type are required" },
      { status: 400 },
    );
  }
  if (!["sql", "formula"].includes(body.logic_type)) {
    return NextResponse.json(
      { error: 'logic_type must be "sql" or "formula"' },
      { status: 400 },
    );
  }

  const llmClient = new MeshLlmClient();
  const scanRun = await scanRepo.createScanRun(tenantId);
  await scanRepo.updateScanRunStatus(scanRun.id, "running");
  try {
    const result = await processReport(
      {
        tenantId,
        reportId: body.report_id,
        logic: body.logic,
        logicType: body.logic_type,
        scanRunId: scanRun.id,
      },
      llmClient,
    );
    let conflictsCreated = 0;
    if (result.success && result.generatedOutput) {
      const conflictResult = await detectConflicts(
        tenantId,
        body.report_id,
        result.generatedOutput,
        new StubNotificationChannel(),
      );
      conflictsCreated = conflictResult.conflictsCreated;
    }
    await scanRepo.updateScanRunStatus(
      scanRun.id,
      result.success ? "completed" : "failed",
      {
        reportsScanned: 1,
        changesDetected: result.skipped ? 0 : 1,
        conflictsFlagged: conflictsCreated,
      },
    );
    return NextResponse.json({
      data: {
        run_id: scanRun.id,
        report_id: body.report_id,
        success: result.success,
        skipped: result.skipped,
        failed_at_step: result.failedAtStep,
        violations: result.violations,
        conflicts_created: conflictsCreated,
      },
    });
  } catch (error) {
    await scanRepo.updateScanRunStatus(scanRun.id, "failed", {
      reportsScanned: 1,
      changesDetected: 0,
      conflictsFlagged: 0,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Semantic ingest failed",
      },
      { status: 500 },
    );
  }
}
