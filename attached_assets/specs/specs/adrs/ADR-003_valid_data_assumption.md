# ADR-003: Assumption of Valid Ingested Data for Canary

**Date:** 15 March 2026
**Status:** Accepted

## Context

During the requirements session for Invoice Ingestion (RB-001), the question of data validation and error handling was raised. The scope of the canary project is strictly focused on building the graph from a known, controlled set of inputs to prove the viability of the architecture.

## Decision

For the duration of the canary project, the system will assume that all ingested invoice data is valid and fully compliant with the data model defined in ADR-001 and the CSV format specified in ADR-002. No data validation, error handling, or quarantining logic will be implemented for the invoice ingestion process.

## Rationale

This decision is a direct application of the MoSCoW scope for the experiment. The primary goal is to build a working invoice graph from dummy data, not to build a production-grade, robust data ingestion pipeline. Introducing validation and error handling would add significant complexity and divert effort from the core task of the canary, which is to validate the graph architecture itself.

By assuming all data is valid, the development effort can be focused exclusively on the data pipeline's "happy path," which is sufficient to meet the canary's acceptance criteria.

## Consequences

- The implementation of the ingestion mechanism is significantly simplified.
- The system will be brittle if it encounters malformed or invalid data; it may crash or produce corrupt graph data. This is an accepted risk for the canary, as the input data will be controlled.
- This decision explicitly defers all work on data validation and error handling to a post-canary phase. The resulting system is not suitable for use with uncontrolled, real-world data.
- Questions 3 ("What makes an invoice valid?") and 4 ("What happens when invalid data is submitted?") from the requirements brief (RB-001) are now resolved for the canary scope: all data is considered valid, and therefore no invalid data will be submitted.

## Review Trigger

This decision must be revisited and fully superseded before the system is considered for any use beyond the initial canary experiment, and especially before it is connected to any live, uncontrolled data sources.
