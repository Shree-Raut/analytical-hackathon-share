import { NextRequest, NextResponse } from "next/server";
import { measureRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  const typeFilter = req.nextUrl.searchParams.get("type");
  const measureType =
    typeFilter === "base" || typeFilter === "derived" ? typeFilter : undefined;
  try {
    const measures = await measureRepo.listMeasures(tenantId, measureType);
    return NextResponse.json({ data: measures });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list semantic measures",
      },
      { status: 500 },
    );
  }
}
