import { NextRequest, NextResponse } from "next/server";
import { entityRepo, measureRepo, versionRepo } from "@/lib/semantic-layer/repositories";
import { tenantFromRequest } from "@/lib/semantic-layer/http";

export async function GET(req: NextRequest) {
  const tenantId = tenantFromRequest(req);
  const versionParam = req.nextUrl.searchParams.get("version");
  try {
    if (versionParam) {
      const version = await versionRepo.getVersionByString(tenantId, versionParam);
      if (!version) {
        return NextResponse.json(
          { error: `Schema version "${versionParam}" not found` },
          { status: 404 },
        );
      }
      return NextResponse.json({
        data: version.snapshot,
        meta: { version: version.version, createdAt: version.createdAt },
      });
    }
    const [entities, relationships, measures, latest] = await Promise.all([
      entityRepo.listEntities(tenantId),
      entityRepo.listRelationships(tenantId),
      measureRepo.listMeasures(tenantId),
      versionRepo.getLatestVersion(tenantId),
    ]);
    return NextResponse.json({
      data: { entities, relationships, measures },
      meta: {
        version: latest?.version ?? "0.0.0",
        entityCount: entities.length,
        relationshipCount: relationships.length,
        measureCount: measures.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error || "Failed to fetch semantic schema"),
      },
      { status: 500 },
    );
  }
}
