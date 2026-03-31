import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiError, apiSuccess } from "@/lib/api-response";

interface MappingInput {
  sourceHeader: string;
  matchedMetric: string | null;
  matchedSlug: string | null;
  confidence: number;
  status?: "matched" | "review" | "unmapped" | "confirmed";
  excluded?: boolean;
  alternatives?: { name: string; slug: string; confidence: number }[];
}

interface ClarificationQuestion {
  id: string;
  column: string;
  question: string;
  suggestedAnswer: string;
  type: "mapping" | "calculation";
  options?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { mappings } = (await req.json()) as { mappings: MappingInput[] };

    const cookieStore = await cookies();
    let customerId = cookieStore.get("activeCustomerId")?.value;
    if (!customerId) {
      const first = await prisma.customer.findFirst({
        orderBy: { createdAt: "asc" },
      });
      customerId = first?.id;
    }

    if (!mappings || !Array.isArray(mappings)) {
      return apiError("mappings array is required", 400);
    }

    const questions: ClarificationQuestion[] = [];
    let qIdx = 0;

    for (const m of mappings) {
      if (m.excluded) continue;
      if (m.status === "confirmed") continue;

      if (m.matchedMetric) {
        const altNames =
          m.alternatives && m.alternatives.length > 1
            ? m.alternatives
                .slice(0, 3)
                .map((a) => a.name)
                .filter((n) => n !== m.matchedMetric)
            : [];

        const optionList = [m.matchedMetric, ...altNames];

        questions.push({
          id: `q-${qIdx++}`,
          column: m.sourceHeader,
          question: `Your **"${m.sourceHeader}"** column was matched to **${m.matchedMetric}** with ${m.confidence}% confidence.${altNames.length > 0 ? ` Other possibilities: ${altNames.join(", ")}.` : ""} Is this correct, or should I map it differently?`,
          suggestedAnswer: `Yes, use ${m.matchedMetric}`,
          type: "mapping",
          options: optionList,
        });
      } else {
        questions.push({
          id: `q-${qIdx++}`,
          column: m.sourceHeader,
          question: `I couldn't confidently match your **"${m.sourceHeader}"** column to any known metric. Would you like to map it to an existing metric, or save it as a custom calculation?`,
          suggestedAnswer: "Skip this column",
          type: "calculation",
          options: [],
        });
      }
    }

    return apiSuccess({
      questions,
      customerId: customerId ?? null,
    });
  } catch {
    return apiError("Failed to generate clarifications", 500);
  }
}
