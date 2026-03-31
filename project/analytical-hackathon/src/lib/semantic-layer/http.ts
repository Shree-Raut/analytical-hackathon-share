import { NextRequest } from "next/server";
import { resolveSemanticTenantId } from "@/lib/semantic-layer/config";

export function tenantFromRequest(req: NextRequest): string {
  const requested =
    req.headers.get("x-tenant-id") || req.nextUrl.searchParams.get("tenant_id");
  return resolveSemanticTenantId(requested);
}
