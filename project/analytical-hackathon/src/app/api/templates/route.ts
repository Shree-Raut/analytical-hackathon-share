import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (active !== null) where.isActive = active === "true";

    const templates = await prisma.reportTemplate.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(templates);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, category, templateType, metricRefs, isActive } = body;

    if (!name || !slug || !description || !category || !templateType) {
      return NextResponse.json(
        { error: "name, slug, description, category, and templateType are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.reportTemplate.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Template with slug "${slug}" already exists` },
        { status: 409 },
      );
    }

    const template = await prisma.reportTemplate.create({
      data: {
        name,
        slug,
        description,
        category,
        templateType,
        metricRefs: metricRefs ? JSON.stringify(metricRefs) : "[]",
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}
