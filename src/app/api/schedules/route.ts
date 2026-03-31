import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("activeCustomerId")?.value;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active customer" },
        { status: 400 },
      );
    }

    const schedules = await prisma.reportSchedule.findMany({
      where: { report: { customerId } },
      include: {
        report: {
          select: { id: true, name: true, templateId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, frequency, dayOfWeek, dayOfMonth, time, recipients, format } = body;

    if (!reportId || !frequency || !time) {
      return NextResponse.json(
        { error: "reportId, frequency, and time are required" },
        { status: 400 },
      );
    }

    const schedule = await prisma.reportSchedule.create({
      data: {
        reportId,
        frequency,
        dayOfWeek: dayOfWeek ?? null,
        dayOfMonth: dayOfMonth ?? null,
        time,
        recipients: recipients ? JSON.stringify(recipients) : "[]",
        format: format ?? "PDF",
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 },
    );
  }
}
