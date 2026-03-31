import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, folder } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 },
      );
    }

    const report = await prisma.customerReport.update({
      where: { id: reportId },
      data: { menuFolder: folder || null },
    });

    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "Failed to assign report to folder" },
      { status: 500 },
    );
  }
}
