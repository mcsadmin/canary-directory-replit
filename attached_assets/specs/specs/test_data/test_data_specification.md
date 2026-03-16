# Test Data Scenario Specification

**Group:** Test Data (supplementary to RB-001 / RB-002)
**Status:** Draft
**Prepared by:** Manus AI, 16 March 2026

---

## 1. Overview

This document specifies a set of test data scenarios for the
canary build of the Local Loop project. It is not the test data
itself, but a structured description of the creditors, CSV files,
expected outcomes, and edge cases that the coding agent will use
to generate the actual test data files and write assertions.

The scenarios are designed to exercise the invoice ingestion
pipeline and entity resolution logic as defined in the relevant
ADRs and feature files. The dataset is deliberately small — small
enough for an operator to verify correctness manually within a
few minutes, but large enough to be non-trivial and to exercise
every confidence tier and key edge case at least once.

---

## 2. Platform and Geographical Context

### 2.1. Creditors

Three creditors are registered on the platform before any CSV
files are uploaded. They are the "known" entities — registered
by the operator — and all begin as `platform_user` / `resolved`.

| Registration Order | Creditor Name | Participation | Verification |
|---|---|---|---|
| 1 | The Corner Shop | `platform_user` | `resolved` |
| 2 | Smith & Jones Solicitors | `platform_user` | `resolved` |
| 3 | Quick-Print Ltd | `platform_user` | `resolved` |

### 2.2. Geographical Catchment Area

For the purpose of testing geographical classification (ADR-014), the platform's catchment area is defined as the **WA7** postcode area.

---

## 3. External Dataset Seed

Before any CSV files are uploaded, the external private business dataset (the Postgres table referenced in ADR-019) is seeded with records. For the purpose of this test, the coding agent should create a table named `external_data` with the structure and content below. The schema is derived from the `external_dataset.csv` file committed alongside this specification.

The `Riverside Garage Ltd` record is the specific target for the secondary search test path in Scenario 3. The other three records are included to provide a complete structural example for the coding agent, as requested.

**Table Name:** `external_data`

| uuid | name | crn | address | postcode | incorporated | lat | lng | company_status |
|---|---|---|---|---|---|---|---|---|
| `20791075...` | Mk Mart (Mk Mart Ltd) | 15383077 | 01 High St, Runcorn | WA7 1BG | 2024-01-03 | 53.34064 | -2.73134 | Active |
| `6774d17c...` | Devine Cosmetics... | 12162272 | 1 - 3 Salisbury Street, Widnes | WA8 6PJ | 2019-08-19 | 53.3673753 | -2.7274548 | Active - Proposal to Strike off |
| `bfa07fa8...` | Drive Development... | 08395882 | 1 1 Fillmore Grove, Widnes | WA8 9QF | 2013-02-08 | 53.38013 | -2.739247 | Active |
| `9f8e7d6c...` | Riverside Garage Ltd | 87654321 | 12 River Road, Runcorn | WA7 9YZ | 2018-05-20 | 53.33000 | -2.74000 | Active |

*(Note: For brevity, only a subset of columns from the source CSV are shown here. The coding agent should use the full 23-column schema from `external_dataset.csv` (committed alongside this specification) when creating the `external_data` table.)*

---

## 4. Test Scenarios

The three CSV files are uploaded in the order shown below. The
order matters because entity resolution depends on the state of
the directory at the time of ingestion.

### 4.1. Scenario 1 — The Corner Shop Ingestion

This is the first file uploaded. It establishes the initial set
of discovered (debtor) businesses and tests basic entity creation
at the low-confidence tier.

#### CSV Content: `corner_shop_invoices.csv`

| creditor_name | debtor_name | amount_due | debtor_address |
|---|---|---|---|
| The Corner Shop | Greens Greengrocers | 150.00 | 14 Green Street, Runcorn, WA7 1AA |
| The Corner Shop | ABC Cleaners Ltd | 75.50 | 2 Industrial Estate, Widnes, WA8 8PZ |
| The Corner Shop | Bob's Coffee | 25.00 | 3 Market Square, Runcorn, WA7 1BE |

#### Expected Outcome

**Row 1 — Greens Greengrocers.** No match exists. A new business node is created (`third_party`, `unresolved`). Its `geographical_status` is set to **`local`** because its postcode (WA7 1AA) is inside the catchment area. This is a **low-confidence** outcome.

**Row 2 — ABC Cleaners Ltd.** The name is normalised to `abc cleaners`. No match exists. A new business node is created (`third_party`, `unresolved`). Its `geographical_status` is set to **`remote`** because its postcode (WA8 8PZ) is outside the catchment area. This tests **name normalisation — suffix stripping** (ADR-017).

**Row 3 — Bob's Coffee.** No match exists. A new business node is created (`third_party`, `unresolved`). Its `geographical_status` is set to **`local`**. This is a **low-confidence** outcome.

**Directory state after Scenario 1:** 3 creditor nodes + 3 new debtor nodes = 6 total nodes.

---

### 4.2. Scenario 2 — Smith & Jones Solicitors Ingestion

This file tests high and medium-confidence matching, the "prefer false negatives" principle, `do_not_match` rule creation, and contact entity creation.

#### CSV Content: `smith_jones_invoices.csv`

| creditor_name | debtor_name | amount_due | debtor_contact_name |
|---|---|---|---|
| Smith & Jones Solicitors | The Corner Shop | 500.00 | |
| Smith & Jones Solicitors | ABC Window Cleaners | 120.00 | |
| Smith & Jones Solicitors | Bobs Coffee House | 30.00 | |
| Smith & Jones Solicitors | Greens Greengrocers | 99.00 | Mr. Dave Smith |

#### Expected Outcome

**Row 1 — The Corner Shop.** A **high-confidence** match is found against the existing `platform_user` / `resolved` node. The invoice is attached. This tests **cross-file entity resolution**.

**Row 2 — ABC Window Cleaners.** A **medium-confidence** match is found against "ABC Cleaners". A new node is created and a review queue item is generated. The operator **rejects** the match, creating a `do_not_match` rule (ADR-028). The new node's `geographical_status` is **`uncertain`** as no address is provided.

**Row 3 — Bobs Coffee House.** A **medium-confidence** match is found against "Bob's Coffee". A new node is created and a review queue item is generated. The operator **accepts** the match, and the nodes are merged.

**Row 4 — Mr. Dave Smith (at Greens Greengrocers).** A **high-confidence** match is found for the business "Greens Greengrocers". Because `debtor_contact_name` is present, a new **Contact entity** for "Mr. Dave Smith" is created and linked to the "Greens Greengrocers" business node (ADR-011). The invoice is attached to the business node.

**Directory state after Scenario 2:** 6 nodes + 2 new debtor nodes (ABC Window Cleaners, Bobs Coffee House) + 1 new contact = 8 nodes, 1 contact. After the merge, the directory has **7 nodes, 1 contact**.

---

### 4.3. Scenario 3 — Quick-Print Ltd Ingestion

This file tests high-confidence matching, optional field ingestion, the external dataset path, and the company number uniqueness constraint.

#### CSV Content: `quick_print_invoices.csv`

| creditor_name | debtor_name | amount_due | debtor_company_number |
|---|---|---|---|
| Quick-Print Ltd | Greens Greengrocers | 45.00 | |
| Quick-Print Ltd | General Mechanics Ltd | 250.00 | 12345678 |
| Quick-Print Ltd | Riverside Garage | 180.00 | |
| Quick-Print Ltd | General Mechanics Group | 300.00 | 12345678 |

#### Expected Outcome

**Row 1 — Greens Greengrocers.** A **high-confidence** match is found against the existing node. The invoice is attached.

**Row 2 — General Mechanics Ltd.** No match exists. A new business node is created (`third_party`, `unresolved`) with `company_number: 12345678`. `geographical_status` is `uncertain`.

**Row 3 — Riverside Garage.** No match in the internal directory. A **high-confidence** match is found in the external dataset. A new business node is created (`third_party`, `resolved`) with `company_number: 87654321` and `geographical_status: local` (from the external record's WA7 postcode).

**Row 4 — General Mechanics Group.** A low-confidence name match is found for "General Mechanics Ltd". However, the `company_number` `12345678` is a **hard conflict** with the existing node (ADR-021). A new node is **not** created. An item is created in the **operator review queue** to resolve the data conflict.

**Directory state after Scenario 3:** 7 nodes + 2 new debtor nodes (General Mechanics Ltd, Riverside Garage) = **9 nodes, 1 contact**.

---

## 5. Final Directory State

After all files are processed and operator actions completed, the directory should contain:

- **9 Business Nodes**
- **1 Contact Entity**
- **11 Invoices**
- **3 Review Queue Items**

| # | Canonical Name | Participation | Verification | Geo Status | Company Number | Notes |
|---|---|---|---|---|---|---|
| 1 | The Corner Shop | `platform_user` | `resolved` | `local` | — | Creditor. Also a debtor. |
| 2 | Smith & Jones Solicitors | `platform_user` | `resolved` | `uncertain` | — | Creditor only. |
| 3 | Quick-Print Ltd | `platform_user` | `resolved` | `uncertain` | — | Creditor only. |
| 4 | Greens Greengrocers | `third_party` | `unresolved` | `local` | — | 3 invoices attached. Linked to contact "Mr. Dave Smith". |
| 5 | ABC Cleaners | `third_party` | `unresolved` | `remote` | — | `do_not_match` rule with ABC Window Cleaners. |
| 6 | ABC Window Cleaners | `third_party` | `unresolved` | `uncertain` | — | `do_not_match` rule with ABC Cleaners. |
| 7 | Bob's Coffee | `third_party` | `unresolved` | `local` | — | Merged with "Bobs Coffee House". |
| 8 | General Mechanics Ltd | `third_party` | `unresolved` | `uncertain` | 12345678 | In conflict with "General Mechanics Group". |
| 9 | Riverside Garage | `third_party` | `resolved` | `local` | 87654321 | Created via external dataset match. |

---

## 6. Blind Spot Acknowledgement

This test data specification is sufficient for integration testing of the entity resolution pipeline. However, it does not constitute a comprehensive unit test suite for the **Name Normalisation Module** (ADR-017). The module's internal logic should be tested independently with a much wider range of variations to ensure its robustness.
