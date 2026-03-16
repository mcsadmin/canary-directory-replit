# RB-001 Acceptance Criteria

This document lists the formal acceptance criteria for the Invoice Ingestion requirements group (RB-001). Each criterion is an observable condition that must be met for the implementation to be considered complete.

---

### Must Have: A working invoice graph populated from CSV files

**AC-01: The system can ingest a CSV file containing a single invoice.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 1 in `invoice_ingestion.feature` and verifying that one new invoice record is created in the database.

**AC-02: The system can ingest a CSV file containing multiple invoices for different debtors.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 2 in `invoice_ingestion.feature` and verifying that the correct number of new invoice records are created.

**AC-03: The system creates distinct invoice records for multiple invoices to the same debtor.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 3 in `invoice_ingestion.feature` and verifying that two distinct invoice records are created.

**AC-04: The system gracefully handles an empty (but valid) CSV file.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 4 in `invoice_ingestion.feature` and verifying that zero new invoice records are created and no error is raised.

**AC-05: The system correctly processes invoices with a zero amount due.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 5 in `invoice_ingestion.feature` and verifying that one new invoice record with an amount of 0.00 is created.

**AC-06: The system correctly ingests optional data fields when present.**
*   **Linked to:** Must Have: A working invoice graph populated from CSV files
*   **Confirmed by:** Executing Scenario 6 in `invoice_ingestion.feature` and verifying that the new invoice record contains the correct optional data.

### Must Have: A clear, unambiguous data model for an invoice

**AC-07: Every ingested invoice is assigned a system-generated UUID.**
*   **Linked to:** Must Have: A clear, unambiguous data model for an invoice
*   **Confirmed by:** Inspecting the database records created by all scenarios in `invoice_ingestion.feature` and confirming the presence and format of the `invoice_id`.

### Must Have: A mechanism for a trusted operator to submit invoice data

**AC-08: The ingestion process is initiated by a user with the appropriate permissions.**
*   **Linked to:** Must Have: A mechanism for a trusted operator to submit invoice data
*   **Confirmed by:** The `Background` step in `invoice_ingestion.feature`, which establishes that the upload is performed by a resolved `platform_user` ("Creditor Corp").
