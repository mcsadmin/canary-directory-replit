# RB-005: Gap and Blind Spot Analysis

**Date:** 16 March 2026
**Status:** Final

---

## 1. Introduction

This report examines the final RB-005 (Non-Functional Requirements) artefact set for gaps, unstated assumptions, and potential blind spots. The analysis was performed after the final integrity and completeness check. It compares the specified NFRs against the full context of the project and the goal of creating a robust, preservable core system.

**Conclusion:** Two significant blind spots have been identified. They relate to the deliberate minimalism of the canary's observability and the lack of true load testing. It is recommended that these are formally acknowledged and deferred to the production system's requirements.

---

## 2. Analysis and Findings

### Finding 1: Observability is Limited to System-Level Health

**Gap:** The observability requirements (ADR-035) are intentionally minimal, focusing on stdout/stderr logs and a simple `/healthz` endpoint that checks the database connection. This is sufficient to answer the question, "Is the system running?"

**Blind Spot:** This approach provides no insight into the *application's* internal behaviour or the quality of the data it is processing. There are no requirements for application-level metrics. For example:

*   How long does each stage of the ingestion pipeline take?
*   What is the average confidence score of automated merges?
*   How many items are in the operator review queue?

**Impact:** While appropriate for the canary, this creates a significant blind spot. A subtle bug in the entity resolution logic (e.g., a change that degrades match quality) would not trigger any alerts or be visible in the logs. Debugging performance regressions or data quality issues would be extremely difficult. The current observability model can detect a crash, but not a slow decay.

**Recommendation:** Formally defer the requirement for application-level metrics. A new issue should be added to `ISSUES.md` titled "Implement Application-Level Metrics for Production Observability." This makes it explicit that the production system will require a much more sophisticated monitoring solution (e.g., integration with Prometheus/Grafana or Datadog) to provide insight into the health of the core data pipeline.

### Finding 2: Performance Testing is Not Load Testing

**Gap:** The performance requirement (ADR-032) specifies a target for ingesting a file with 1,000 rows. This is a valuable performance benchmark for a common use case.

**Blind Spot:** This benchmark does not constitute a load test. It does not answer critical questions about the system's stability and behaviour at the edge of its capacity or under sustained pressure. For example:

*   What happens when a 100,000-row file is uploaded? Does performance degrade linearly, or does it fall off a cliff?
*   What is the memory usage profile during a large ingestion?
*   How does the system respond if an operator tries to filter the directory while a large file is being ingested?

**Impact:** The system's behaviour under high load is completely unknown. This is an acceptable risk for the canary, which uses controlled test data. However, it means the current design has not been validated for scalability. The production system, which will face unpredictable real-world data volumes, could fail in unexpected ways.

**Recommendation:** Formally defer the requirement for load and stress testing. A new issue should be added to `ISSUES.md` titled "Define and Execute Load and Stress Tests for Production Scalability." This acknowledges that the current performance target is a baseline, not a guarantee of stability at scale, and that a dedicated workstream will be needed to harden the system for production.

---

## 3. Summary of Recommendations

1.  **Formally defer application-level metrics:** Add a new deferred issue to `ISSUES.md` to address this for the production system.
2.  **Formally defer load and stress testing:** Add a new deferred issue to `ISSUES.md` to address this for the production system.
