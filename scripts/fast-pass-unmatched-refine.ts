import {
  claimPendingUnmatched,
  completeUnmatchedJob,
} from "../src/lib/fast-pass/repositories/learningRepository";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const limit = Number(process.env.UNMATCHED_BATCH_LIMIT || "20");

async function run() {
  const jobs = await claimPendingUnmatched(limit);
  if (jobs.length === 0) {
    console.log(JSON.stringify({ ok: true, totalClaimed: 0, resolved: 0, failed: 0 }));
    return;
  }

  const headers = jobs.map((j) => j.sourceHeader);
  const jobIds: Record<string, string> = {};
  for (const job of jobs) jobIds[job.sourceHeader] = job.id;

  let resolvedByBundle = 0;
  let resolvedByLlm = 0;
  let resolvedByFallback = 0;
  let failed = 0;
  const unresolvedHeaders: string[] = [];

  try {
    const resolveRes = await fetch(`${baseUrl}/api/fast-pass/unmatched/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headers, jobIds }),
    });
    const resolvePayload = (await resolveRes.json()) as {
      results?: Array<{ sourceHeader: string; resolvedBy: string; recommendation: string | null }>;
      telemetry?: Record<string, unknown>;
    };

    if (resolveRes.ok && resolvePayload.results) {
      for (const r of resolvePayload.results) {
        if (r.resolvedBy === "bundle_sync") resolvedByBundle++;
        else if (r.resolvedBy === "llm_async") resolvedByLlm++;
        else unresolvedHeaders.push(r.sourceHeader);
      }
    } else {
      unresolvedHeaders.push(...headers);
    }
  } catch {
    unresolvedHeaders.push(...headers);
  }

  for (const header of unresolvedHeaders) {
    const jobId = jobIds[header];
    if (!jobId) continue;
    try {
      const mapRes = await fetch(`${baseUrl}/api/fast-pass/map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers: [header] }),
      });
      const mapPayload = (await mapRes.json()) as {
        mappings?: Array<{ matchedSlug: string | null; confidence: number }>;
      };
      if (!mapRes.ok || !mapPayload.mappings?.length) {
        throw new Error("map call failed for unmatched refinement");
      }
      const top = mapPayload.mappings[0];
      await completeUnmatchedJob({
        id: jobId,
        recommendationSlug: top.matchedSlug,
        recommendationConfidence: top.confidence,
      });
      resolvedByFallback++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "refinement failed";
      await completeUnmatchedJob({ id: jobId, error: message });
      failed++;
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        totalClaimed: jobs.length,
        resolvedByBundle,
        resolvedByLlm,
        resolvedByFallback,
        failed,
        total: resolvedByBundle + resolvedByLlm + resolvedByFallback + failed,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  const message =
    error instanceof Error ? error.message : "fast-pass-unmatched-refine failed";
  console.error(message);
  process.exit(1);
});

export {};
