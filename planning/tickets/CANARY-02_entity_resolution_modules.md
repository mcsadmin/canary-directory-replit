# CANARY-02: Entity Resolution Modules

- **Status:** Not Started
- **Depends On:** CANARY-01
- **Requirements:** ADR-013, ADR-014, ADR-015, ADR-017, ADR-018, ADR-019

---

## Implementation Plan

Create `artifacts/api-server/src/modules/` with clean interfaces per ADR:

1. **`nameNormaliser.ts`** — `normalise(raw: string): string`. Lowercase, strip legal suffixes (Ltd, Limited, Inc, PLC, LLP, Co, Company, Corp, Corporation, Group, Services, Solutions, Consultancy, and variants), trim/collapse whitespace.
2. **`matcher.ts`** — `findCandidates(normalisedName: string, details: DebtorDetails, db: DB): Promise<Candidate[]>`. Returns scored candidates from internal directory. Checks do_not_match rules. Uses Levenshtein distance → high(≥80)/medium(15–79)/low(<15) tiers. Configurable thresholds from env vars.
3. **`geoClassifier.ts`** — `classify(address?: string, postcode?: string): GeoStatus`. Canary: parses postcode, checks if it matches configured catchment area prefix (WA7). Returns local/remote/uncertain.
4. **`canonicalNameAssigner.ts`** — `assign(names: string[]): string`. Returns first name in list (canary: first invoice name).
5. **`creditorVerifier.ts`** — `isResolved(node: BusinessNode): boolean`. Canary stub: registered platform_users are always resolved.
6. **`externalDataModule.ts`** — `findExternalMatch(details: DebtorDetails, db: DB): Promise<ExternalRecord | null>`. Canary stub: always returns null (but queries table correctly when company_number provided).

## Acceptance Criteria

- Each module exports a clean function interface matching ADR definitions
- Name normaliser strips: "Ltd", "Limited", "Inc", "PLC", "LLP", "Co.", "Corp", "Group", "Services"
- Matcher returns correct tier based on Levenshtein distance ratio
- Do-not-match rules filter candidates correctly
- Geo classifier correctly classifies WA7 postcodes as local
