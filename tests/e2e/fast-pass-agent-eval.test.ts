import { describe, expect, it } from "vitest";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const shouldRun = process.env.RUN_E2E === "true";

describe("fast-pass agent e2e", () => {
  it.skipIf(!shouldRun)(
    "returns mappings from live map endpoint",
    async () => {
      const response = await fetch(`${baseUrl}/api/fast-pass/map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: ["Market Rent", "Lease Term", "Unknown Header XYZ"],
        }),
      });
      expect(response.ok).toBe(true);
      const payload = await response.json();
      expect(Array.isArray(payload.mappings)).toBe(true);
      expect(payload.mappings.length).toBe(3);
    },
    45_000,
  );
});
