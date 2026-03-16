# RB-003 Integrity and Completeness Check

**Date:** 16 March 2026
**Status:** **PASS**

---

This document records the results of three successive integrity and completeness checks performed during the RB-003 session. The first check identified five issues. The second check confirmed all five were resolved. The third check verified the ADR renumbering and addition of ADR-020 (Invoice Graph Admission Rule) as an RB-002 amendment.

---

## First Check: Issues Identified

The first integrity check was performed on the initial draft artefact set (ADRs numbered 020-023 at that time). Five issues were identified:

| Issue | Severity | Description |
|---|---|---|
| Issue 1 | Medium | Audit event types (`NODE_CREATED`, `NODE_MERGED`, `STATUS_CHANGED`) used in traceability scenarios but not defined in the data dictionary. |
| Issue 2 | High | Company number uniqueness scenario prescribed a hard rejection rather than routing to the review queue. |
| Issue 3 | Critical | Two scenarios described the same triggering event (conflicting authoritative data against a resolved entity) but prescribed contradictory outcomes. |
| Issue 4 | Low | A traceability scenario had a `Given` step that performed an action rather than setting up a precondition. |
| Issue 5 | Medium | Same root cause as Issue 1 (event types not in data dictionary). |

---

## Second Check: All Issues Resolved

After corrections were applied, the second check verified all eight integrity dimensions:

### 1. ADR-to-Scenario Traceability

**Check:** Does every ADR have at least one scenario that tests it? Does every scenario reference a valid ADR?

| ADR | Scenarios Testing It | Status |
|---|---|---|
| ADR-021 (Consistency) | 6 scenarios in `directory_consistency.feature` | PASS |
| ADR-022 (Accuracy) | 4 scenarios in `directory_accuracy.feature` | PASS |
| ADR-023 (Determinism) | 2 scenarios in `directory_reliability.feature` | PASS |
| ADR-024 (Traceability) | 4 scenarios in `directory_traceability.feature` | PASS |

All ADR references in feature file comments are valid. **PASS.**

### 2. Scenario-to-Traceability Matrix Consistency

**Check:** Does the traceability matrix list every scenario in the feature files, with the correct ADR references?

Feature files contain 16 scenarios total. Traceability matrix contains 16 rows. All scenario names match exactly. All ADR references are correct.

**PASS.**

### 3. Acceptance Criteria Coverage

**Check:** Do the acceptance criteria cover all feature files and all ADRs?

| Criteria ID | Feature File | ADR | Status |
|---|---|---|---|
| AC-003-01 | `directory_consistency.feature` | ADR-021 | PASS |
| AC-003-02 | `directory_accuracy.feature` | ADR-022 | PASS |
| AC-003-03 | `directory_reliability.feature` | ADR-023 | PASS |
| AC-003-04 | `directory_traceability.feature` | ADR-024 | PASS |

**PASS.**

### 4. Data Dictionary Consistency

**Check:** Are all entities and attributes referenced in ADRs and scenarios accounted for in the data dictionary?

- ADR-021 references: `node_id`, `company_number`, `participation_status`, `verification_status`, `canonical_name`, `invoice_aliases`, `non_invoice_aliases`. All exist in the RB-002 Business Node Entity. **PASS.**
- ADR-022 references: `Upper Confidence Threshold`, `Lower Confidence Threshold` (from ADR-013). These are configuration parameters, not data dictionary entities. **PASS.**
- ADR-023 references: No new entities or attributes. **PASS.**
- ADR-024 references: `NODE_CREATED`, `NODE_MERGED`, `STATUS_CHANGED` event types. These are now defined as values of the new `event_type` ENUM in `data_dictionary_rb003.md`. **PASS.**

**PASS.**

### 5. Issues File Completeness

**Check:** Are all deferred items from the session captured?

Four items were deferred during the session. All four are present in `ISSUES.md`:

| Issue | Description | Status |
|---|---|---|
| ISS-001 | Idempotent Ingestion | Deferred |
| ISS-002 | Robustness and Graceful Degradation | Deferred |
| ISS-003 | Directory Reconstructibility from Audit Trail | Deferred |
| ISS-004 | Automatic Status Downgrade via Doubt Accumulation | Deferred |

**PASS.**

### 6. Cross-ADR Consistency

**Check:** Do the new ADRs (021-024) reference the correct existing ADRs without contradiction?

- ADR-021 references ADR-009 (Decoupled Entity Status). ADR-021 correctly states that reversion from `resolved` to `unresolved` is operator-only, not automatic. This is consistent with the accuracy scenario in `directory_accuracy.feature` which states that conflicting data does not automatically overwrite a resolved node. **PASS.**
- ADR-022 references ADR-006 (Prefer False Negatives), ADR-013 (Confidence Threshold Model), and ADR-016 (Operator Review Queue). All references are consistent. The conflicting data scenario creates a new unresolved node and a review item, consistent with ADR-006's false-negative preference. **PASS.**
- ADR-023 references ISS-001 for idempotency deferral. Consistent with ISSUES.md. **PASS.**
- ADR-024 references ADR-012 (Audit Trail Requirements) and ISS-003 for reconstructibility deferral. Consistent. **PASS.**

**PASS.**

### 7. Terminology Consistency

**Check:** Is the language consistent across all artefacts?

- No instances of "corrupt" in scenarios or ADR decisions. Replaced with "overwrite" throughout. **PASS.**
- No instances of the old four-state model (`registered`, `member`). All scenarios use the current two-axis model. **PASS.**
- No instances of "obligation." All scenarios use "invoice." **PASS.**
- The term "overwrite" is used consistently in the accuracy feature file and is consistent with the ADR-021 state transition constraint. **PASS.**

**PASS.**

### 8. Cross-Scenario Consistency (Previously Critical Issue)

**Check:** Do any scenarios describe the same event but prescribe contradictory outcomes?

The previously contradictory scenarios have been reconciled:

- `directory_consistency.feature` now tests that an operator can manually revert a resolved entity to unresolved.
- `directory_accuracy.feature` now tests that conflicting data from a new invoice does not automatically modify a resolved entity; instead, a new unresolved node is created and a review item is queued.

These two scenarios are now complementary, not contradictory. The consistency scenario tests the manual path; the accuracy scenario tests the automated path. Both are consistent with the agreed rule that only operators can change the status of a resolved entity.

**PASS.**

---

## Third Check: ADR Renumbering Verification

During the session, a foundational rule about invoice graph admission was surfaced and captured as **ADR-020: Invoice Graph Admission Rule**, formally added as an amendment to the RB-002 artefact set. This required renumbering all RB-003 ADRs from 020-023 to 021-024. The third check verified:

| Check | Result |
|---|---|
| ADR-020 (RB-002 amendment) exists and is correctly self-referencing | **PASS** |
| ADR-021-024 (RB-003) titles updated in file headers | **PASS** |
| Feature file ADR references all updated to new numbers | **PASS** |
| Traceability matrix — all 16 rows match all 16 scenarios exactly, with correct new ADR numbers | **PASS** |
| Acceptance criteria — all four criteria reference correct new ADR numbers | **PASS** |
| ISSUES.md — ISS-004 references updated to ADR-021, ADR-022 | **PASS** |
| Data dictionary — references ADR-024 correctly | **PASS** |
| Session summary — updated with ADR-020 amendment narrative and new numbers | **PASS** |
| No stale "corrupt" in scenarios or ADR decisions | **PASS** |
| No stale terminology (obligation, registered, member) | **PASS** |
| RB-002 amendment record exists and references ADR-020 | **PASS** |

**PASS.**

---

## Observation

The `data_dictionary_rb003.md` introduces `ATTRIBUTE_CHANGED` as a valid `event_type` value, but no Gherkin scenario currently tests this event type. This is not an integrity issue (the data dictionary is allowed to be broader than the current scenario set), but it is noted for completeness. A scenario testing the logging of an attribute change (e.g., an operator updating a canonical name) could be added in a future iteration.

---

## Conclusion

All checks across all three rounds pass. The five issues from the first check have been resolved. The ADR renumbering has been verified. The artefact set is internally consistent and complete.
