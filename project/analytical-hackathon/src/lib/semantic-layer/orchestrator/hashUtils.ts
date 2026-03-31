/**
 * Hash Utilities
 *
 * Provides deterministic SHA-256 hashing for prompt chain inputs.
 * Used by the idempotency guard (VR-8, NFR-2) and the orchestrator
 * to ensure the same input produces the same hash across runs (FR-4).
 *
 * Design ref: design.md §2 (Determinism)
 */

import { createHash } from 'crypto';

/**
 * Computes a SHA-256 hash of the given input, producing a deterministic
 * 64-character hex string. Objects are JSON-serialized with sorted keys
 * to ensure consistent hashing regardless of property insertion order.
 *
 * @param input - Any value to hash (string, object, array, etc.)
 * @returns 64-character hex SHA-256 digest
 */
export function sha256(input: unknown): string {
  const serialized =
    typeof input === 'string'
      ? input
      : JSON.stringify(input, Object.keys(input as object).sort());

  return createHash('sha256').update(serialized).digest('hex');
}
