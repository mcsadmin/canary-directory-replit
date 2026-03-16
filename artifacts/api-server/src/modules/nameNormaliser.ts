/**
 * Name Normalisation Module (ADR-017)
 *
 * Implements the `normalise(raw: string) -> string` interface.
 * Canary implementation: lowercase, strip common legal suffixes,
 * trim whitespace, collapse multiple spaces.
 */

const LEGAL_SUFFIXES = [
  "limited liability partnership",
  "limited liability company",
  "community interest company",
  "community benefit society",
  "co-operative",
  "cooperative",
  "corporation",
  "incorporated",
  "consulting",
  "consultancy",
  "solutions",
  "services",
  "holdings",
  "partners",
  "company",
  "limited",
  "trading",
  "group",
  "corp",
  "llp",
  "ltd",
  "plc",
  "inc",
  "llc",
  "cic",
  "cbs",
  "co",
];

/**
 * Normalises a raw business name for matching purposes.
 * @param raw - The raw name string from any source
 * @returns A normalised string suitable for comparison
 */
export function normalise(raw: string): string {
  if (!raw) return "";

  let result = raw.toLowerCase();

  // Remove punctuation that's typically decorative
  result = result.replace(/[''`]/g, "");
  result = result.replace(/[&]/g, "and");
  result = result.replace(/[-–—]/g, " ");

  // Remove trailing legal suffixes (sorted by length desc to match longest first)
  const sortedSuffixes = [...LEGAL_SUFFIXES].sort((a, b) => b.length - a.length);

  // Strip suffix patterns: "name ltd.", "name ltd", "name (ltd)", "name, ltd"
  for (const suffix of sortedSuffixes) {
    // Match at word boundary, optionally preceded by comma, space, parens, dot
    const pattern = new RegExp(
      `[,\\s.]*[\\(]?\\b${escapeRegex(suffix)}\\b[\\)]?\\.?\\s*$`,
      "i",
    );
    result = result.replace(pattern, "");
  }

  // Collapse multiple spaces and trim
  result = result.replace(/\s+/g, " ").trim();

  // Remove remaining punctuation (dots, commas at end)
  result = result.replace(/[.,!?;:]+$/, "").trim();

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
