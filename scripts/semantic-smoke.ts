const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";
const tenantId =
  process.env.SEMANTIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

async function ensureOk(name: string, response: Response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${name} failed: ${response.status} ${body}`);
  }
  return response.json();
}

async function main() {
  console.log("Running semantic smoke checks...");

  const schemaRes = await fetch(`${baseUrl}/api/v1/semantic/schema`, {
    headers: { "x-tenant-id": tenantId },
  });
  await ensureOk("semantic schema", schemaRes);

  const mapRes = await fetch(`${baseUrl}/api/fast-pass/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headers: ["Occupancy %", "Net Effective Rent"] }),
  });
  await ensureOk("fast-pass map", mapRes);

  const composeRes = await fetch(`${baseUrl}/api/ai/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Create an occupancy trend report" }),
  });
  await ensureOk("ai compose", composeRes);

  console.log("Semantic smoke checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
