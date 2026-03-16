# Data Dictionary - RB-003

**Date:** 16 March 2026

---

This document updates the existing Data Dictionary with attributes and entities introduced as part of Requirements Group 003. It should be read as a diff against the RB-002 Data Dictionary.

## Audit Log Entity (Update)

**Source ADR:** [ADR-024: Directory Traceability Properties](ADR-024_Directory_Traceability_Properties.md)

Two new attributes are added to the Audit Log Entity.

The `event_type` attribute provides a structured, queryable classification for all state-changing events. The `actor_id` attribute records the identity of the agent (system process or human operator) responsible for the event, which is required by the traceability scenarios in `directory_traceability.feature`.

| Attribute | Data Type | Description |
|---|---|---|
| `event_type` | ENUM | A structured type for the event being logged. Must be one of: `NODE_CREATED`, `NODE_MERGED`, `STATUS_CHANGED`, `ATTRIBUTE_CHANGED`. |
| `actor_id` | UUID (nullable) | The identifier of the actor who triggered the event. For automated events (e.g., `NODE_CREATED` during ingestion), this is `null` or a system identifier. For manual events (e.g., an operator merge or status change), this is the operator's user ID. Required to satisfy the traceability requirement that operator actions are attributable. |

The existing `outcome` field, which is a free-text string, will now be used to store human-readable details of the outcome, while `event_type` provides the machine-readable classification.
