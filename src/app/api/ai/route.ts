import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateAnswer } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, customerId: bodyCustomerId } = body as {
      question: string;
      customerId?: string;
    };

    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const customerId =
      bodyCustomerId || cookieStore.get("activeCustomerId")?.value;

    const result = await generateAnswer(question, customerId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Explorer error:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 },
    );
  }
}
