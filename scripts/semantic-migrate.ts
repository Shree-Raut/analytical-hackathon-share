import { readFile } from "fs/promises";
import path from "path";
import { pool } from "../src/lib/semantic-layer/db/connection";

async function main() {
  const migrationPath = path.resolve(
    process.cwd(),
    "src/lib/semantic-layer/db/migrations/001_create_semantic_layer_tables.sql",
  );
  const sql = await readFile(migrationPath, "utf8");
  // Ensure UUID generator is available before running migration defaults.
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await pool.query(sql);
  console.log("Semantic layer migration applied.");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Semantic migration failed:", error);
    await pool.end();
    process.exit(1);
  });
