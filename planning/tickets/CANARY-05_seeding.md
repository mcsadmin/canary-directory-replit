# CANARY-05: Database Seeding

- **Status:** Not Started
- **Depends On:** CANARY-01
- **Requirements:** ADR-031, test_data_specification.md

---

## Implementation Plan

Create `scripts/src/seed.ts`:

1. Create single hard-coded operator account (ADR-031)
2. Seed external_data table with 4 records from specification (including Riverside Garage Ltd, added per agreement)
3. Export seed function callable separately from migrations

Configure catchment area: WA7 postcode prefix stored in env config.

The 3 creditors (The Corner Shop, Smith & Jones Solicitors, Quick-Print Ltd) are NOT seeded here — they are created via the creditor registration workflow to test that path.

## Acceptance Criteria

- Seed script is idempotent (safe to re-run)
- Operator account exists after seeding
- external_data table contains exactly 4 records including Riverside Garage Ltd
