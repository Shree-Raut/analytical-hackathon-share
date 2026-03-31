import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { status, acknowledgedBy, snoozedUntil } = body;

  if (!status) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = { status };
  if (acknowledgedBy) updateData.acknowledgedBy = acknowledgedBy;
  if (snoozedUntil) updateData.snoozedUntil = new Date(snoozedUntil);
  if (status === "RESOLVED") updateData.resolvedAt = new Date();

  const alert = await prisma.alert.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(alert);
}
