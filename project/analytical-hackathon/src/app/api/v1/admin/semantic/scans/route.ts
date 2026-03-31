import { NextRequest, NextResponse } from "next/server";
import { scanRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  try {
    const runs = await scanRepo.listScanRuns(tenantId);
    return NextResponse.json({ data: runs });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list semantic scans",
      },
      { status: 500 },
    );
  }
}
