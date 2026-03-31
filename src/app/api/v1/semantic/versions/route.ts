import { NextRequest, NextResponse } from "next/server";
import { versionRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  try {
    const versions = await versionRepo.listVersions(tenantId);
    return NextResponse.json({ data: versions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list semantic versions",
      },
      { status: 500 },
    );
  }
}
