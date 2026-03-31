import { readFile } from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";

const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";
const tenantId =
  process.env.SEMANTIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with code ${result.status}`);
  }
}

async function ingestFixture(fileName: string) {
  const filePath = path.resolve(process.cwd(), "fixtures/irl-reports", fileName);
  const body = JSON.parse(await readFile(filePath, "utf8"));
  const response = await fetch(`${baseUrl}/api/v1/admin/semantic/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Ingest failed for ${fileName}: ${JSON.stringify(data)}`);
  }
  console.log(`Ingested ${fileName}:`, data.data);
}

async function main() {
  console.log("== Semantic local harness ==");
  console.log("1) Running semantic migration...");
  run("npm", ["run", "semantic:migrate"]);

  console.log("2) Refreshing catalog from SDET (best effort)...");
  try {
    run("npm", ["run", "semantic:refresh-catalog"]);
  } catch (error) {
    console.warn(
      "Catalog refresh failed (often expected if SDET DB is not running). Continuing...",
    );
  }

  console.log("3) Ingesting IRL logic fixtures...");
  await ingestFixture("occupancy_logic.json");
  await ingestFixture("net_effective_rent_logic.json");

  console.log("Semantic local harness complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
