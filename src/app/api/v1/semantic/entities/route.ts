import { NextRequest, NextResponse } from "next/server";
import { entityRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  const nameFilter = req.nextUrl.searchParams.get("name")?.toLowerCase();
  try {
    const entities = await entityRepo.listEntities(tenantId);
    const filtered = nameFilter
      ? entities.filter((entity) => entity.name.toLowerCase().includes(nameFilter))
      : entities;
    return NextResponse.json({ data: filtered });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list semantic entities",
      },
      { status: 500 },
    );
  }
}
