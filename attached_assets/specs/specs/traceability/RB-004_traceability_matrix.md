# RB-004 Traceability Matrix (Final)

| Scenario | Feature Section | Primary ADR(s) | Notes |
|---|---|---|---|
| The operator registers a new platform user (creditor) | Creditor Registration | ADR-031 | Tests the manual creation of a resolved platform user, which is a prerequisite for invoice ingestion. |
| The operator views the main directory data table | Q1: The Directory Data Table | ADR-025 | Tests that the data table displays the correct columns with the correct default sort order. |
| The operator filters the directory data table | Q1: The Directory Data Table | ADR-025 | Tests the filtering capability of the data table. |
| The operator successfully uploads an invoice file for a specific creditor | Q2: The Invoice Ingestion Mechanism | ADR-026, ADR-031 | Tests the ingestion workflow, including the critical step of selecting the creditor for whom the file is being submitted. |
| The operator reviews and accepts a proposed match | Q3 & PI-008: The Operator Review Queue | ADR-027, ADR-012, ADR-024 | Tests the accept-match action in the review queue, including audit trail logging. |
| The operator reviews and rejects a proposed match | Q3 & PI-008: The Operator Review Queue | ADR-027, ADR-028 | Tests the reject-match action, including creation of a `do_not_match` rule. |
| A "do not match" rule prevents a future review item from being created | Q3 & PI-008: The Operator Review Queue | ADR-028 | Tests the enforcement of operator-defined match rules. Addresses PI-008. |
| The operator can verify the outcome of an ingestion via the Activity Feed | Q5: Verifying Expected and Unexpected Behaviour | ADR-029 | Tests the Activity Feed as a verification mechanism for ingestion events. |
| The operator can trace a manual merge via the Activity Feed | Q5: Verifying Expected and Unexpected Behaviour | ADR-029, ADR-024 | Tests the Activity Feed as a verification mechanism for manual operator actions. |
| The operator reclassifies a business node as a contact | Q3 & PI-008: The Operator Review Queue | ADR-027, ADR-011 | Tests the reclassify action in the review queue. |
| The operator skips a review item | Q3 & PI-008: The Operator Review Queue | ADR-027 | Tests the skip action in the review queue. |
