import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      answer,
      metricsUsed,
      filtersApplied,
      chartConfig,
      customerId: bodyCustomerId,
    } = body as {
      question: string;
      answer: string;
      metricsUsed?: string[];
      filtersApplied?: Record<string, string>;
      chartConfig?: Record<string, unknown>;
      customerId?: string;
    };

    const cookieStore = await cookies();
    const customerId =
      bodyCustomerId || cookieStore.get("activeCustomerId")?.value;

    if (!question || !answer || !customerId) {
      return NextResponse.json(
        { error: "question, answer, and customerId are required" },
        { status: 400 },
      );
    }

    const saved = await prisma.savedQuery.create({
      data: {
        customerId,
        question,
        answer,
        metricsUsed: JSON.stringify(metricsUsed ?? []),
        filtersApplied: JSON.stringify(filtersApplied ?? {}),
        chartConfig: chartConfig ? JSON.stringify(chartConfig) : null,
        isPinned: true,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Pin query error:", error);
    return NextResponse.json(
      { error: "Failed to pin query" },
      { status: 500 },
    );
  }
}
