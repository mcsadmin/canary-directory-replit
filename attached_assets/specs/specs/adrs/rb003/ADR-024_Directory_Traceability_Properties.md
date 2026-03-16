# ADR-024: Directory Traceability Properties

**Date:** 15 March 2026
**Status:** Accepted

## Context

For the directory to be auditable, debuggable, and trustworthy, every fact and state transition within it must have a clear and verifiable origin. An operator or developer must be able to ask "Where did this data come from?" and "Why did this status change?" and receive a definitive answer. This property is traceability.

## Decision

Directory Traceability is formally defined as the property that **every event that creates or modifies a business node or its attributes must be recorded as a distinct, immutable entry in the audit trail.**

This decision builds upon ADR-012 (Audit Trail Requirements) and makes the following requirements explicit:

1.  **Complete Event Logging:** Every event that creates or modifies a business node must be recorded. This includes, but is not limited to:
    *   Node creation.
    *   Node merges (recording the source and destination nodes).
    *   Status changes (e.g., `unresolved` to `resolved`, or `resolved` back to `unresolved`), including the trigger for the change.
    *   The addition of new aliases.

2.  **Data Provenance:** Every significant attribute of a business node must be directly linkable back to the specific audit trail event that set its value. This provides a clear chain of evidence for the current state of any node.

3.  **Immutable Audit Trail:** The audit trail must be append-only. It must be impossible for an application-level process to modify or delete an audit log entry after it has been written.

**Out of Scope for Canary:** A related, stronger property, **Reconstructibility** (the ability to rebuild the entire directory state from the audit trail), is a known requirement for the production system but is explicitly out of scope for the canary. This has been recorded as issue ISS-003.

## Rationale

Enforcing traceability transforms the directory from a "black box" into a transparent and auditable record. It is essential for debugging complex entity resolution outcomes, for providing accountability for operator actions, and for building long-term trust in the system's data. While full reconstructibility is deferred, establishing the core principles of event logging and data provenance in the canary is a critical first step.

## Consequences

*   The data model for the audit log must be sufficient to capture the details of all state-changing events.
*   All system components that modify the business directory are now required to emit a corresponding audit log entry within the same transaction.

## Review Trigger

This decision should be revisited if the cost of storing a complete audit trail becomes prohibitive, or if a new class of data modification is introduced that does not require traceability.
