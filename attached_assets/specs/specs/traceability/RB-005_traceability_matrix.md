# RB-005 Traceability Matrix

**Date:** 16 March 2026

This matrix maps the Gherkin scenarios for the Non-Functional Requirements group (RB-005) to the Architecture Decision Records (ADRs) they validate.

---

| Scenario                                                    | Feature Section                     | Primary ADR(s)                                                                                             | Notes                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Ingestion of a moderately sized invoice file is performant  | Canary Non-Functional Requirements  | [ADR-032](ADR-032_Canary_Performance_Targets.md)                                                           | Validates the ingestion throughput target.                                                                   |
| Ingestion of an invoice file is atomic                      | Canary Non-Functional Requirements  | [ADR-033](ADR-033_Canary_Reliability_and_Data_Integrity.md)                                                 | Validates the requirement for atomic transactions during ingestion.                                          |
| User-provided content is correctly escaped to prevent XSS   | Canary Non-Functional Requirements  | [ADR-036](ADR-036_Secure_By_Design_Principles.md)                                                          | Validates the XSS prevention principle.                                                                      |
| All visible text on a page is sourced from the i18n framework | Canary Non-Functional Requirements  | [ADR-037](ADR-037_Internationalisation_Framework.md)                                                         | Validates that the i18n framework is being used and is effective.                                            |
| Database schema changes are managed by a migration framework| Canary Non-Functional Requirements  | [ADR-038](ADR-038_Database_Migration_Framework.md)                                                        | Confirms that a migration tool is in use.                                                                    |
| API endpoints are versioned                                 | Canary Non-Functional Requirements  | [ADR-039](ADR-039_API_Versioning_Convention.md)                                                            | Confirms that API routes are correctly namespaced.                                                           |
| API errors are returned in a structured format              | Canary Non-Functional Requirements  | [ADR-040](ADR-040_Structured_Error_Response_Format.md)                                                     | Confirms that API errors follow the standard format.                                                         |
