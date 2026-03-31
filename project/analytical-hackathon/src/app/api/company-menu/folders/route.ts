import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("activeCustomerId")?.value;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active customer" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { oldName, newName, reportIds } = body;

    if (!newName) {
      return NextResponse.json(
        { error: "newName is required" },
        { status: 400 },
      );
    }

    if (oldName && oldName !== newName) {
      await prisma.customerReport.updateMany({
        where: { customerId, menuFolder: oldName },
        data: { menuFolder: newName },
      });
    }

    if (reportIds && Array.isArray(reportIds)) {
      for (const reportId of reportIds) {
        await prisma.customerReport.update({
          where: { id: reportId },
          data: { menuFolder: newName },
        });
      }
    }

    return NextResponse.json({ success: true, folder: newName });
  } catch {
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 },
    );
  }
}
