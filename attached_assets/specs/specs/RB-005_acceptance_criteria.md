# RB-005 Acceptance Criteria

**Date:** 16 March 2026

This document lists the formal acceptance criteria for the Non-Functional Requirements group (RB-005). Each criterion is an observable condition that must be met for the canary to be considered complete from a non-functional perspective.

---

### Must Have: A working sandbox of Local Loop

**AC-05-01: The system meets the defined performance targets for ingestion and UI responsiveness.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the performance scenario in `non_functional_requirements.feature` and verifying the ingestion time. Manually verifying UI responsiveness against the 2-second target defined in ADR-032.

**AC-05-02: The system enforces data integrity through atomic transactions.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the atomicity scenario in `non_functional_requirements.feature` and verifying that a failed ingestion results in a complete rollback, as specified in ADR-033.

**AC-05-03: The system is deployed correctly to the specified environment.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Verifying that the application is running on Railway, accessible via `https://canary.commoner.services`, uses a persistent database volume, and is deployed from a `Dockerfile` as specified in ADR-034.

**AC-05-04: The system provides a basic health check for monitoring.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Accessing the `/healthz` endpoint of the running application and confirming it returns a `200 OK` status with the correct JSON body when the database is connected, as specified in ADR-035.

**AC-05-05: The system is built on a secure foundation.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the XSS scenario in `non_functional_requirements.feature` and code review confirming adherence to the principles in ADR-036 (prepared statements, standard auth libraries).

**AC-05-06: The system is ready for internationalisation.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the i18n scenario in `non_functional_requirements.feature` and code review confirming that no user-visible strings are hard-coded, as specified in ADR-037.

**AC-05-07: The system uses a database migration framework.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the database migration scenario in `non_functional_requirements.feature` and inspecting the repository for a migrations directory, as specified in ADR-038.

**AC-05-08: The system's API is versioned.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the API versioning scenario in `non_functional_requirements.feature` and verifying that API routes are correctly prefixed, as specified in ADR-039.

**AC-05-09: The system provides structured API error responses.**
*   **Linked to:** Must Have: A working sandbox of Local Loop
*   **Confirmed by:** Executing the structured error response scenario in `non_functional_requirements.feature` and verifying the JSON error format, as specified in ADR-040.
