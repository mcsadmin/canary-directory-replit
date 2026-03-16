# RB-003 Traceability Matrix

| Scenario | Feature File | Primary ADR(s) | Notes |
|---|---|---|---|
| The system prevents the creation of a new node that violates company number uniqueness | directory_consistency.feature | ADR-021 | Tests the uniqueness constraint on `company_number` for new node creation. |
| The system prevents an operator merge that would create a company number conflict | directory_consistency.feature | ADR-021 | Tests that uniqueness constraints are enforced during manual operations. |
| A new business node created only from invoice aliases has an empty canonical name | directory_consistency.feature | ADR-021 | Tests the completeness constraint exception for `canonical_name`. |
| A new business node created from an external match has a non-empty canonical name | directory_consistency.feature | ADR-021 | Tests the standard completeness constraint for `canonical_name`. |
| An invoice cannot be created with a link to a non-existent creditor | directory_consistency.feature | ADR-021 | Tests the referential integrity constraint for invoices. |
| An operator can revert a resolved entity to unresolved | directory_consistency.feature | ADR-021 | Tests the manual state transition constraint for `verification_status`. |
| A high-confidence match correctly merges with an existing node | directory_accuracy.feature | ADR-022, ADR-013 | Tests the "accurate" definition by confirming the high-confidence path. |
| A low-confidence match correctly creates a duplicate node by design | directory_accuracy.feature | ADR-022, ADR-013 | Tests the "accurate" definition by confirming the low-confidence (false negative) path. |
| A medium-confidence match correctly creates a new node and a review item | directory_accuracy.feature | ADR-022, ADR-013 | Tests the "accurate" definition by confirming the medium-confidence (human-in-the-loop) path. |
| Conflicting authoritative data does not automatically overwrite a resolved node's attributes | directory_accuracy.feature | ADR-022 | Tests the principle of protecting resolved data by creating a new node and a review item. |
| Entity resolution is order-independent | directory_reliability.feature | ADR-023 | Tests the "reliable" (deterministic) property by processing inputs in one order. |
| Entity resolution is order-independent (reversed) | directory_reliability.feature | ADR-023 | Tests the "reliable" (deterministic) property by processing inputs in the reverse order. |
| A node creation event is recorded in the audit trail | directory_traceability.feature | ADR-024 | Tests the "traceable" property by verifying event logging. |
| An operator's merge decision is fully traceable | directory_traceability.feature | ADR-024 | Tests that manual, state-changing events are logged. |
| A manual change in verification status is traceable | directory_traceability.feature | ADR-024 | Tests that manual, state-changing events are logged with their triggers. |
| The system prevents modification of an audit log entry | directory_traceability.feature | ADR-024 | Tests the immutability requirement of the audit trail. |
