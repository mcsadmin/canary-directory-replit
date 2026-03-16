# ADR-023: Directory Determinism

**Date:** 15 March 2026
**Status:** Accepted

## Context

For the directory to be reliable, its state must be a predictable function of its inputs. If the same set of invoices can produce different directory structures depending on incidental factors like the order in which they are processed, the system becomes impossible to debug, test, or trust. This property is often referred to as determinism.

## Decision

Directory Reliability for the canary is formally defined as the property of **determinism**. The entity resolution and ingestion pipeline must be designed to be order-independent. 

Given any set of input invoice files, the final state of the directory (including the number of business nodes, their attributes, and the links between them) must be identical regardless of the sequence in which those files are processed.

**Out of Scope for Canary:** A related reliability property, **idempotency** (the ability to re-process the same input multiple times without creating duplicates), is a known requirement for the production system but is explicitly out of scope for the canary. This has been recorded as issue ISS-001.

## Rationale

Enforcing determinism is critical for creating a stable and testable system. It ensures that the state of the directory is a direct, repeatable consequence of the data it has seen, not an artefact of processing sequence. This allows for consistent test results, predictable behavior, and the ability to debug resolution issues by replaying a specific set of inputs in any order.

## Consequences

*   The entity resolution algorithm cannot rely on state that is modified during a batch process in a way that would affect the outcome for later items in the same batch. For example, if matching against a newly created node, the logic must be carefully designed to ensure the final result is the same no matter which invoice created the node first.
*   Testing for this property will require specific test harnesses that can run the same set of inputs in different permutations and assert that the final database state is identical.

## Review Trigger

This decision should be revisited if a future requirement emerges that is fundamentally path-dependent, though such a requirement would need to be scrutinized heavily for its impact on system predictability.
