# RB-002 Gap Analysis and Blind Spot Review (Final)

**Date:** 15 March 2026
**Prepared by:** Requirements Coaching Agent
**Scope:** Final assessment of the complete RB-002 artefact set against the sufficiency test.

---

## How to Read This Document

This final review assesses the artefact set's completeness and identifies the direct consequences of the architectural decisions made during this session. It is structured in three parts:

1.  **Sufficiency Test Assessment:** A final pass/fail check against the five criteria in the RB-002 brief.
2.  **Scenario Coverage:** A confirmation of the scenario coverage.
3.  **Consequences and Next Actions:** A summary of the new work items created as a consequence of the decisions made.

---

## Part 1: Sufficiency Test Assessment

### Criterion 1: The matching logic is specified as testable scenarios.

**Rating: Pass.**

ADR-013 (Confidence Threshold Model) defines the three-tier logic (high/medium/low) based on two configurable thresholds. The feature file contains three concrete, testable scenarios that cover each of these confidence bands. The *implementation* of the scoring algorithm itself is encapsulated in the Matching Module, but the *logic* used by the core system is now fully specified.

### Criterion 2: The registered/inferred distinction is defined and its transitions are explicit.

**Rating: Pass.**

ADR-009 (Decoupled Entity Status) provides a robust model separating `participation_status` from `verification_status`. All four high-priority lifecycle transition scenarios identified in the initial gap analysis have been reinstated into the feature file, ensuring this criterion is met.

### Criterion 3: "Minimal human input" has a concrete meaning.

**Rating: Pass.**

ADR-016 (Operator Review Queue) defines the exact data structure for a review item, the conditions under which an item is created, and the specific actions an operator can take. The feature file includes scenarios for the creation of review items and the consequences of an operator's decision. This provides a concrete and testable definition of the human input loop.

### Criterion 4: Name variation handling is addressed.

**Rating: Pass.**

ADR-017 (Name Normalisation Module) defines the architectural decision to handle name variation via a dedicated black-box module. This module is responsible for cleaning and standardising names before they are passed to the Matching Module. This fully addresses the requirement.

### Criterion 5: The relationship between entity resolution and existing invoice records is clear.

**Rating: Pass.**

The scenarios for merging two nodes and for creating a "do not match" rule have been reinstated into the feature file. These scenarios explicitly test that invoices are re-pointed and that aliases are correctly managed, making the relationship clear and testable.

---

## Part 2: Scenario Coverage

All high and medium priority scenarios identified in the initial gap analysis are now present in the final `entity_resolution.feature` file. The file provides comprehensive coverage of the core logic, entity lifecycles, operator reviews, and the interfaces to all external modules.

---

## Part 3: Consequences and Next Actions

The most significant outcome of this requirements session has been the consistent application of a black-box architectural pattern. While this has resulted in a clean, decoupled, and highly testable core system design, it has also created a new set of work items. The following **six modules** are now defined by their interfaces (their ADRs) but must be designed, built, and tested as separate work items:

1.  **Matching Module (ADR-013):** Takes entity details and returns a confidence score from 0-100.
2.  **Geographical Classification Module (ADR-014):** Takes entity details and returns a status of `local`, `remote`, or `uncertain`.
3.  **Canonical Name Module (ADR-015):** Takes all known aliases for an entity and returns a single canonical name.
4.  **Name Normalisation Module (ADR-017):** Takes a raw name string and returns a normalised version.
5.  **Creditor Verification Module (ADR-018):** Takes a creditor ID and returns `true` if they are a valid, resolved user, and `false` otherwise.
6.  **External Data Module (ADR-019):** Takes entity details and queries a Postgres table to return a matched external record or `null`.

These modules represent the primary technical debt and the immediate next actions for the development team. The requirements for the core system are now complete, but the work has been intentionally and cleanly partitioned into these six new components.

---

## Summary Recommendation

The artefact set for RB-002 is now **sufficient to close**. All five sufficiency criteria are met, and all identified gaps have been addressed. The primary consequence of this closure is the formal creation of the six new modules listed above. The next phase of work should be the detailed design and implementation of these modules.
