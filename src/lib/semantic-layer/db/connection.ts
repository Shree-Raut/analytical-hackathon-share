/**
 * Database connection module.
 *
 * Provides a shared Postgres client pool used by all repositories.
 * Connection string is read from the DATABASE_URL environment variable.
 */

import { Pool, type PoolConfig } from "pg";

const semanticDbUrl =
  process.env.SEMANTIC_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith("postgres")
    ? process.env.DATABASE_URL
    : "postgres://postgres:postgres@localhost:5432/semantic_layer_dev");

const isRds = (semanticDbUrl ?? "").includes(".rds.amazonaws.com");

const poolConfig: PoolConfig = {
  connectionString: semanticDbUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ...(isRds && { ssl: { rejectUnauthorized: false } }),
};

/** Shared connection pool — import and use across repositories. */
export const pool = new Pool(poolConfig);

/**
 * Gracefully shuts down the connection pool.
 * Call during application teardown or in test afterAll hooks.
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
