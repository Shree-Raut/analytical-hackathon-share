import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    fastPassMappingMemory: {
      findMany,
    },
  },
}));

describe("learningRepository", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("normalizes mapping headers consistently", async () => {
    const { normalizeMappingHeader } = await import(
      "@/lib/fast-pass/repositories/learningRepository"
    );
    expect(normalizeMappingHeader(" Market Rent* ")).toBe("market_rent");
    expect(normalizeMappingHeader("Lease/Term (Months)")).toBe("lease_term_months");
  });

  it("queries memory rows for normalized headers", async () => {
    findMany.mockResolvedValueOnce([]);
    const { getMemoryForHeaders } = await import(
      "@/lib/fast-pass/repositories/learningRepository"
    );
    await getMemoryForHeaders(["Market Rent", "Lease Term"], "tenant-1");
    expect(findMany).toHaveBeenCalledOnce();
    expect(findMany.mock.calls[0][0]).toMatchObject({
      where: {
        tenantId: "tenant-1",
        headerPattern: { in: ["market_rent", "lease_term"] },
      },
    });
  });
});
