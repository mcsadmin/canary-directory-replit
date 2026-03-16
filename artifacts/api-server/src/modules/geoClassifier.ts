/**
 * Geographical Classification Module (ADR-014)
 *
 * Canary implementation: compares postcode against configured catchment area prefix.
 * Returns local/remote/uncertain.
 */

export type GeoStatus = "local" | "remote" | "uncertain";

const CATCHMENT_POSTCODE_PREFIX = process.env["CATCHMENT_POSTCODE_PREFIX"] ?? "WA7";

/**
 * Classifies a business as local, remote, or uncertain based on address/postcode.
 * @param address - Full address string (optional)
 * @param postcode - Explicit postcode (optional, takes priority over address parsing)
 * @returns GeoStatus
 */
export function classify(address?: string | null, postcode?: string | null): GeoStatus {
  const effectivePostcode = extractPostcode(postcode ?? address ?? "");

  if (!effectivePostcode) {
    return "uncertain";
  }

  const prefix = effectivePostcode.trim().toUpperCase().split(" ")[0];

  if (prefix === CATCHMENT_POSTCODE_PREFIX.toUpperCase()) {
    return "local";
  }

  return "remote";
}

/**
 * Extracts a UK postcode from a string.
 * UK postcode pattern: 1-2 letters, 1-2 digits, optional space, 1 digit, 2 letters
 */
function extractPostcode(text: string): string | null {
  const pattern = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i;
  const match = text.match(pattern);
  return match ? match[1].toUpperCase() : null;
}
