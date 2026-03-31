import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listSemanticMetrics } from "@/lib/semantic-layer/adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, formula, format, category, sourceSystem } = body;

    if (!name || !slug || !description || !formula || !format || !category || !sourceSystem) {
      return NextResponse.json(
        { error: "name, slug, description, formula, format, category, and sourceSystem are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.metricDefinition.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Metric with slug "${slug}" already exists` },
        { status: 409 },
      );
    }

    const metric = await prisma.metricDefinition.create({
      data: { name, slug, description, formula, format, category, sourceSystem },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create metric" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const semanticTenantId = cookieStore.get("activeCustomerId")?.value ?? null;
    const metrics = await prisma.metricDefinition.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        format: true,
        category: true,
        description: true,
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    const semanticMetrics = await listSemanticMetrics(semanticTenantId);

    const categories: Record<
      string,
      { id: string; name: string; slug: string; format: string; description: string }[]
    > = {};

    const seenSlugs = new Set<string>();

    for (const m of metrics) {
      const cat = m.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({
        id: m.id,
        name: m.name,
        slug: m.slug,
        format: m.format,
        description: m.description,
      });
      seenSlugs.add(m.slug);
    }
    for (const m of semanticMetrics) {
      if (seenSlugs.has(m.slug)) continue;
      const cat = m.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({
        id: m.id,
        name: m.name,
        slug: m.slug,
        format: m.format,
        description: m.description,
      });
      seenSlugs.add(m.slug);
    }

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
