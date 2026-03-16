# ADR-026: Operator Invoice Ingestion Workflow

**Date:** 16 March 2026
**Status:** Accepted

## Context

Requirements brief RB-004 (Q2) requires a specification for the operator's user experience when uploading invoice data. While ADR-002 and ADR-004 define the data format (CSV) and constraints (one creditor per file), they do not specify the user interface or the feedback mechanism for the ingestion process. A clear, predictable workflow is needed for the operator.

## Decision

The user interface for invoice ingestion will provide a dedicated file upload mechanism with clear feedback at each stage of the process.

1.  **Creditor Selection:** Before uploading, the operator must select the creditor for whom they are submitting data. The UI will provide a dropdown list populated with the `canonical_name` of all business nodes that have `participation_status = platform_user`.

2.  **Upload Mechanism:** The UI will feature a standard file input component. Once a creditor is selected, the file input will become active.

2.  **Processing Feedback:** Once a file is selected or dropped, the UI will provide immediate visual feedback (e.g., a progress bar or spinner) to indicate that the file is being uploaded and processed. During this time, the upload component will be disabled to prevent concurrent uploads.

3.  **Completion Summary:** Upon completion of the ingestion process, the operator will be presented with a modal summary report. The operator will not be redirected away from their current view. The summary report will contain the following key metrics:
    *   Filename of the uploaded file.
    *   Total number of rows processed.
    *   Number of new invoice records created in the active graph.
    *   Number of new invoice records created in a `pending` state (as per ADR-020).
    *   Number of new `Business Nodes` created.
    *   Number of new items added to the `Operator Review` queue.

4.  **User Action:** The summary report will have a "Dismiss" button. After the operator dismisses the report, the underlying directory data table will be refreshed to reflect the changes from the ingestion.

## Rationale

This workflow provides a minimal, functional interface for validating the invoice ingestion pipeline. The summary report directly answers the operator's question: "What happened as a result of my action?" which is the core requirement for validation.

In line with the canary UI scope (ADR-030), the implementation should be simple (e.g., a standard file input and a basic modal dialog). The goal is to confirm the backend processing, not to provide a polished or high-throughput upload experience.

## Consequences

-   The backend must provide an API endpoint that accepts the file upload and, upon completion, returns a structured JSON object containing the metrics for the summary report.
-   The frontend application must implement the file upload component, the visual feedback for the processing state, the summary report modal, and the logic to refresh the main data view upon dismissal.

## Review Trigger

This decision should be revisited if operator feedback suggests the summary report is insufficient and a more detailed, line-by-line breakdown of the ingestion process is required for verification.
