import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateSemanticGuidedReport } from "@/lib/semantic-layer/compose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, customerId: bodyCustomerId } = body as {
      prompt: string;
      customerId?: string;
    };

    const cookieStore = await cookies();
    const customerId =
      bodyCustomerId || cookieStore.get("activeCustomerId")?.value;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    const result = await generateSemanticGuidedReport(prompt, customerId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Compose error:", error);
    return NextResponse.json(
      { error: "Failed to compose report" },
      { status: 500 },
    );
  }
}
