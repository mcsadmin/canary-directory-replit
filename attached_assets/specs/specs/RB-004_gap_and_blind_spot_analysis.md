# RB-004: Gap and Blind Spot Analysis

**Date:** 16 March 2026
**Status:** Final

---

## 1. Introduction

This report examines the final RB-004 artefact set for gaps, unstated assumptions, and potential blind spots. The analysis was performed after the integrity and completeness check passed (with corrections). It compares the specified UI and verification behaviour against the full context of dependency artefacts (especially from RB-002) and the project-level goal of creating an unambiguous specification for a coding agent.

**Conclusion:** Three gaps have been identified. Two relate to missing scenarios for specified-but-untested operator actions and error states. The third relates to an ambiguity in how the UI handles large volumes of data. It is recommended that the first two are addressed by adding new scenarios and the third is formally deferred.

---

## 2. Analysis and Findings

### Finding 1: Incomplete Operator Action Coverage in Review Queue

**Gap:** ADR-016 (`Operator Review Queue`) defines four possible operator actions on a pending review item: `Accept`, `Reject`, `Reclassify`, and `Skip`. However, ADR-027 (`Operator Review Queue Interface`) and the `operator_ui_and_verification.feature` file only specify and test the `Accept Match` and `Reject Match` actions.

**Impact:** The UI specification is incomplete. A coding agent would not implement the `Reclassify` or `Skip` actions, as they are not described in any testable Gherkin scenario. This leaves a gap between the abstract data model (ADR-016) and the functional UI specification (ADR-027).

**Recommendation:** Formally decide whether `Reclassify` and `Skip` are in scope for the canary UI. 
*   **If IN SCOPE:** Add two new scenarios to the feature file to describe the operator performing these actions and their expected outcomes. Update ADR-027 to include these actions in the UI.
*   **If OUT OF SCOPE:** Add a note to ADR-027 explicitly stating that these two actions are deferred for the canary, and log this in the `ISSUES.md` file for completeness.

### Finding 2: No Scenarios for UI Error Handling

**Gap:** The current scenarios exclusively cover the "happy path" — successful uploads, successful merges, etc. There are no scenarios that describe what the operator should see if an operation fails.

**Examples:**
*   What happens if the operator uploads a CSV file that is malformed or does not match the spec in ADR-010?
*   What happens if the backend returns an error during a merge operation (e.g., due to a database constraint violation or network failure)?

**Impact:** The required behaviour for common failure modes is unspecified. This leaves the implementation to the coding agent's discretion, which risks inconsistent or unhelpful error feedback for the operator and violates the "no ambiguity" principle.

**Recommendation:** Add at least one new scenario to cover a UI-level failure. A scenario for uploading a malformed CSV file would be the most direct way to address this. It should specify that a clear, user-friendly error message is displayed and the system state remains unchanged.

### Finding 3: Ambiguity on UI Behaviour at Scale (Pagination)

**Gap:** The specifications for the Directory Data Table (ADR-025) and the Operator Review Queue (ADR-027) do not mention pagination. They implicitly assume a small number of records that can be displayed on a single page.

**Impact:** While ADR-030 (Canary UI Scope) defines the UI as a lightweight validation tool, a complete lack of pagination could render it unusable if even a moderately large test dataset (e.g., 10,000+ nodes or 1,000+ review items) is used. The behaviour is currently undefined.

**Recommendation:** Formally defer this requirement. The lightweight UI scope makes implementing full pagination unnecessary for the canary. However, this assumption should be made explicit. Add a new deferred issue to `ISSUES.md` titled "UI Pagination for Large Datasets" and add a note to ADR-025 and ADR-027 stating that for the canary, it is assumed the number of records will be small enough not to require pagination.

---

## 3. Summary of Recommendations

1.  **Decide on `Reclassify` and `Skip` actions:** Either add scenarios to implement them or formally defer them.
2.  **Add an error handling scenario:** Add a new scenario to the feature file for a failed operation, such as uploading a malformed CSV.
3.  **Formally defer pagination:** Add a deferred issue and update ADR-025/ADR-027 to make the assumption explicit.
