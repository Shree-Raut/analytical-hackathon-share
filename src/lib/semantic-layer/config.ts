export const DEFAULT_SEMANTIC_TENANT_ID =
  process.env.SEMANTIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export function resolveSemanticTenantId(
  requested?: string | null,
): string {
  // semantic-layer schema expects UUID tenant IDs; fall back to a stable default
  if (
    requested &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requested,
    )
  ) {
    return requested;
  }
  return DEFAULT_SEMANTIC_TENANT_ID;
}
