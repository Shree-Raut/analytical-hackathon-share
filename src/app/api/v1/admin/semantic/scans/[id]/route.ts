import { NextRequest, NextResponse } from "next/server";
import { scanRepo } from "@/lib/semantic-layer/repositories";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const run = await scanRepo.findScanRunById(id);
    if (!run) {
      return NextResponse.json({ error: "Scan run not found" }, { status: 404 });
    }
    const traces = await scanRepo.listTracesForRun(id);
    return NextResponse.json({ data: { ...run, traces } });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch semantic scan",
      },
      { status: 500 },
    );
  }
}
