# Data Dictionary - RB-004

**Date:** 16 March 2026

---

This document updates the existing Data Dictionary with attributes and entities introduced as part of Requirements Group 004. It should be read as a diff against the RB-002 and RB-003 Data Dictionaries.

## Match Rule Entity

**Source ADR:** [ADR-028: Operator-Defined Match Rules](ADR-028_Operator-Defined_Match_Rules.md)

This entity stores explicit matching rules created by operators to override the default entity resolution behavior.

| Attribute | Data Type | Description |
|---|---|---|
| `rule_id` | UUID | A unique identifier for the rule. |
| `node_id_a` | UUID | The ID of the first business node in the pair. |
| `node_id_b` | UUID | The ID of the second business node in the pair. |
| `rule_type` | ENUM (`do_not_match`) | The constraint to apply to this pair of nodes. The `do_match` rule is deferred (ISS-006). |
| `created_by` | UUID | The `operator_id` of the user who created the rule. |
| `created_at` | timestamp | The timestamp when the rule was created. |
