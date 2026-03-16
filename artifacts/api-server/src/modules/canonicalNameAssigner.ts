/**
 * Canonical Name Assignment Module (ADR-015)
 *
 * Canary implementation: returns the first name in the list.
 * The first invoice name is used as the canonical name.
 * Operators can update via the review queue.
 */

/**
 * Assigns a canonical name from a list of candidate names.
 * @param names - Array of candidate names (first is from the first invoice)
 * @returns The selected canonical name
 */
export function assignCanonicalName(names: string[]): string {
  if (names.length === 0) return "";
  return names[0];
}
