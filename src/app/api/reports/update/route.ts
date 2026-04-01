import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportId, name } = body;

    if (!reportId || !name) {
      return NextResponse.json(
        { error: "reportId and name are required" },
        { status: 400 },
      );
    }

    // Verify the report exists
    const existingReport = await prisma.customerReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 },
      );
    }

    // Update the report name
    const updatedReport = await prisma.customerReport.update({
      where: { id: reportId },
      data: {
        name: name.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        report: updatedReport 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 },
    );
  }
}
