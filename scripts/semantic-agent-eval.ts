const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";

async function main() {
  console.log("Running semantic agent eval...");

  const clarifyRes = await fetch(`${baseUrl}/api/fast-pass/clarify/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message:
        "This is occupancy percent for total units and should map to occupancy.",
      question: {
        id: "eval-q-1",
        column: "Occ %",
        question: "Map Occ %",
        suggestedAnswer: "Use Occupancy Rate",
        type: "mapping",
        options: ["Occupancy Rate", "Average Rent"],
      },
      conversationHistory: [],
      mappings: [
        {
          sourceHeader: "Occ %",
          matchedMetric: null,
          matchedSlug: null,
          confidence: 35,
        },
      ],
      allMetrics: [
        {
          id: "1",
          name: "Occupancy Rate",
          slug: "occupancy_rate",
          format: "percent",
          category: "leasing",
          description: "Occupied units divided by total units",
        },
        {
          id: "2",
          name: "Average Rent",
          slug: "average-rent",
          format: "currency",
          category: "revenue",
          description: "Average monthly rent",
        },
      ],
    }),
  });

  const clarifyData = await clarifyRes.json();
  if (!clarifyRes.ok) {
    throw new Error(`Clarify eval failed: ${JSON.stringify(clarifyData)}`);
  }
  const actionType = clarifyData?.action?.type;
  if (actionType !== "update_mapping") {
    throw new Error(
      `Expected clarify action update_mapping, got: ${JSON.stringify(clarifyData)}`,
    );
  }
  console.log("Clarify eval passed:", clarifyData.action);

  console.log("Semantic agent eval complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
