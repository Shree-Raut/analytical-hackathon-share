import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { recordMappingSignal, type MappingSignalAction } from "@/lib/fast-pass/repositories/learningRepository";
import { apiError, apiSuccess } from "@/lib/api-response";

interface FeedbackSignal {
  sourceHeader: string;
  metricSlug?: string | null;
  action: MappingSignalAction;
  context?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { signals?: FeedbackSignal[]; source?: string };
    const signals = Array.isArray(body.signals) ? body.signals : [];
    if (signals.length === 0) {
      return apiError("signals array is required", 400);
    }

    const cookieStore = await cookies();
    const tenantId = cookieStore.get("activeCustomerId")?.value ?? null;
    const source = typeof body.source === "string" ? body.source : "fast-pass-ui";

    for (const signal of signals) {
      if (!signal || typeof signal.sourceHeader !== "string" || !signal.sourceHeader.trim()) {
        continue;
      }
      await recordMappingSignal({
        tenantId,
        sourceHeader: signal.sourceHeader,
        metricSlug: signal.metricSlug || null,
        action: signal.action,
        source,
        context: signal.context || {},
      });
    }

    return apiSuccess({ success: true, recorded: signals.length });
  } catch {
    return apiError("Failed to record feedback signals", 500);
  }
}
