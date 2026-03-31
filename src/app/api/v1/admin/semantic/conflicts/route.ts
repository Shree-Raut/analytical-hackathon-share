import { NextRequest, NextResponse } from "next/server";
import { conflictRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  const statusQuery = req.nextUrl.searchParams.get("status") || "open";
  const status =
    statusQuery === "open" || statusQuery === "resolved" || statusQuery === "dismissed"
      ? statusQuery
      : "open";
  try {
    const conflicts = await conflictRepo.listConflictsByStatus(tenantId, status);
    return NextResponse.json({ data: conflicts });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list semantic conflicts",
      },
      { status: 500 },
    );
  }
}
