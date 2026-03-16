# RB-002 Traceability Matrix

| Scenario | Feature Section | Primary ADR(s) | Notes |
|---|---|---|---|
| A new, unmatchable business is discovered through an invoice | Core Entity Resolution Logic | ADR-005, ADR-009, ADR-010 | Tests the creation of a new, unresolved `third_party` node. |
| An invoice is processed for a named person at a known business | Contact and Business Distinction | ADR-011 | Tests the creation of a `Contact` linked to an existing `Business Node`. |
| An invoice is processed for a named person with an ambiguous business link | Contact and Business Distinction | ADR-011 | Tests the creation of a `Contact` and a new `Business Node` with a review flag. |
| A debtor name is a high-confidence match for an existing business | Handling Ambiguous and Incomplete Data | ADR-006, ADR-013 | Tests the high-confidence path of the threshold model. |
| A debtor name is a medium-confidence match for an existing business | Handling Ambiguous and Incomplete Data | ADR-006, ADR-013 | Tests the medium-confidence path of the threshold model. |
| A debtor name is a low-confidence match for an existing business | Handling Ambiguous and Incomplete Data | ADR-006, ADR-013 | Tests the low-confidence path of the threshold model. |
| All match attempts are logged for traceability and review | Auditing | ADR-012 | Confirms that the audit log is created with the correct data. |
| A new user registers for the platform with no prior history | Entity Lifecycle and State Transitions | ADR-009 | Tests the creation of a new, unresolved `platform_user`. |
| An existing third-party entity registers for the platform | Entity Lifecycle and State Transitions | ADR-009 | Tests the state transition from `third_party` to `platform_user`. |
| A platform user's identity is resolved by an operator | Entity Lifecycle and State Transitions | ADR-009 | Tests the state transition from `unresolved` to `resolved`. |
| An operator merges a duplicate third-party record into a resolved one | Entity Lifecycle and State Transitions | ADR-009, ADR-012 | Tests the merge operation and its audit trail. |
| An operator rejects a proposed entity merge | Entity Lifecycle and State Transitions | ADR-009, ADR-012 | Tests the creation of a "do not match" rule. |
| An invoice is processed with conflicting authoritative data | Entity Lifecycle and State Transitions | ADR-009 | Tests the system's response to a data conflict. |
| A new business is classified as local | Geographical Classification | ADR-014 | Tests the `local` status assignment. |
| A new business is classified as remote | Geographical Classification | ADR-014 | Tests the `remote` status assignment. |
| A new business has an uncertain location | Geographical Classification | ADR-014 | Tests the `uncertain` status assignment. |
| A new business node's canonical name is assigned by the dedicated module | Canonical Name Assignment | ADR-015 | Tests the call to the Canonical Name Module. |
| A medium-confidence match creates a review queue item | Operator Review Queue | ADR-016 | Tests the creation of a review item. |
| An operator accepts a proposed match | Operator Review Queue | ADR-016, ADR-012 | Tests the 'accept' action and its audit trail. |
| An operator rejects a proposed match | Operator Review Queue | ADR-016, ADR-012 | Tests the 'reject' action and its audit trail. |
| An invoice file from an unresolved creditor is held in a pending state | Creditor Verification | ADR-018 | Tests the creditor verification check at the point of ingestion. |
| A new business is verified via the external dataset | External Dataset Integration | ADR-019 | Tests the creation of a resolved node from an external match. |
| Optional invoice fields are correctly ingested and stored | Integrity Check Scenarios | ADR-010 | Confirms that the extended invoice model is correctly processed. |
| An operator reclassifies an entity from a business to a contact | Integrity Check Scenarios | ADR-011, ADR-016 | Tests the reclassification action in the operator review queue. |
| The name normalisation process is applied correctly | Integrity Check Scenarios | ADR-017 | Confirms that the Name Normalisation Module is called correctly. |
