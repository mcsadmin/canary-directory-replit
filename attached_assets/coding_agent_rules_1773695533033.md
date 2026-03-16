# Coding Agent Rules — Canary Build

**Prepared by:** Coaching Agent
**Date:** 16 March 2026
**Status:** Approoved

---

## 1. How to Use This Document

This document defines **how you must work** during the canary build. It accompanies the **Coding Agent Handoff Brief**, which defines **what you must build**.

Read this document in full before writing any code. Then, read the handoff brief. You must follow all rules in both documents.

### The Hierarchy of Authority

If you find a contradiction between documents, the order of precedence is as follows:

1.  **Requirements Artefacts are supreme.** The Gherkin feature files and Architectural Decision Records (ADRs) in `/specs/` are the single source of truth for what the system must do. No other document can override them.
2.  **The Handoff Brief is the primary build instruction.** It interprets the requirements and provides a concrete plan for the build. Where it summarises a requirement, it is for convenience; the full requirement in the spec file always governs.
3.  **These Coding Rules govern your working process.** They define the standards and protocols you must follow. They cannot override the handoff brief or the requirements.

If you perceive a conflict, stop and flag it in a commit message.

---

## 2. The Coaching Relationship

The coaching task in Manus reads your commit log as its primary signal of what is happening in the build. Verbose, well-structured commit messages are essential for this monitoring to be effective. Thin commit messages degrade the coaching agent's ability to monitor the experiment and flag problems early.

**This is not optional.** The commit protocol below is mandatory.

---

## 3. The Commit Protocol

Every commit must have a **verbose message body**. The subject line is one sentence. The body is five to six sentences covering:

1.  **What was done** — the specific change made.
2.  **Why it was done** — the reasoning or requirement it addresses (cite the ADR or feature file).
3.  **Design decisions made** — any choices between alternatives, and why this one was chosen.
4.  **Concerns or uncertainties** — anything you are not confident about, or that might need review.
5.  **Deviations from specification** — any place where the implementation differs from the spec or agreed architecture, and why.

### Example Commit Message (Canary Context)

```
feat: Implement simple Levenshtein matching module

Implemented the matching module as a simple function using the 'fast-levenshtein' library, as per the canary disposition for ADR-013. The function takes two normalised strings and returns a confidence score.

This addresses the matching module requirement from the handoff brief (Section 4). The goal is to provide a simple, replaceable implementation for the canary.

Chose 'fast-levenshtein' over other libraries as it is lightweight and has no dependencies, which is suitable for the `node:18-alpine` base image. The confidence score is currently a raw Levenshtein distance; the calling code will need to translate this into high/medium/low tiers based on the configurable thresholds from ADR-013.

I am uncertain if the raw distance is the best metric to return. It might be better for this module to return the tier directly. Flagging for review, but proceeding with the current implementation as it meets the letter of the ADR.

No deviation from the agreed interface in ADR-013.
```

### Commit Frequency

Commit **often**. Small, frequent commits with verbose bodies are far more useful than large, infrequent commits with thin messages. Commit at least at the end of every meaningful unit of work, and whenever you have something working that you do not want to lose.

### Direct Commit Requirement

Since you cannot connect directly to Git, the commit protocol should be observed as if you were making commits. Prepend each commit message to a standalone markdown file.

---

## 4. What to Do When Stuck

If you are stuck — the code is not working, a requirement is ambiguous, or you are uncertain about an architectural decision — **stop and flag it**. Do not spend more than 20-30 minutes on a problem without producing a working artefact or a clear question.

Write a commit with a message body explaining what you tried, what you expected, what actually happened, and why you are stuck. Then, flag the issue to the user.

**Do not resolve ambiguity silently.**

---

## 5. Mandated Technical Standards

### Test Framework

Automated testing is a first-class requirement. The mandated test framework is:

| Layer | Tool | Purpose |
|---|---|---|
| Unit and integration | **Vitest** | Business logic, data pipeline, entity resolution modules |
| End-to-end | **Playwright** | Application behaviour from the user's perspective, against a running deployment |

A feature is not considered complete until its corresponding Gherkin scenarios are covered by passing automated tests.

### Security Principles

The following principles apply from the first line of code:

1.  **Validate at the boundary:** Validate and sanitise all external inputs at the point of entry. For the canary, this applies particularly to the CSV ingestion pipeline.
2.  **No secrets in code:** All credentials, API keys, and tokens must be stored as environment variables. Never commit a secret, even temporarily.
3.  **Fail securely:** When something goes wrong (e.g., a database error during ingestion), the system must fail in a way that does not expose data or leave the system in an inconsistent state. Errors should be logged with context but not surfaced to end users in raw form.
4.  **Auditability:** Significant operations (node creation, invoice ingestion, review queue decisions) must be logged with enough context to reconstruct what happened and why, as specified in ADR-012 and ADR-024.

### Documentation and Logging

-   **Documentation:** Every module must have a `README.md` explaining its purpose and interface. Every public function must have a docstring.
-   **Logging:** Use structured logging for all significant operations. Errors must be logged with context.


---

## 6. Decomposing the Build (Optional)

The handoff brief is substantial. You may choose to build the canary in a single pass, or you may choose to break the build down into smaller, sequenced chunks.

If you choose to break the build down, you **must** externalise your plan by writing implementation tickets **before** you write any feature code. This is a lightweight planning step that should take minutes, not hours.

### Ticket Protocol

1.  **Create a directory:** `/planning/tickets/`.
2.  **Write tickets:** Create one Markdown file per ticket in this directory (e.g., `01_database_schema.md`, `02_csv_ingestion.md`). Use a numeric prefix for ordering.
3.  **Use the template:** Each ticket must follow the template below.
4.  **Commit the plan:** Commit the full set of tickets in a single commit with the subject line `chore: Decompose build into N tickets`.

### Ticket-to-Commit Traceability

For every subsequent commit that implements a ticket, you **must** reference the ticket ID in the commit subject line. For example:

`feat(CANARY-01): Implement database schema and migrations`

### Ticket Template

Use this template for every ticket file. The ticket ID (e.g., `CANARY-01`) should be derived from the filename.

```markdown
# CANARY-XX: [Ticket Title]

-   **Status:** Not Started
-   **Depends On:** [CANARY-YY, CANARY-ZZ | None]
-   **Requirements:** [ADR-XXX, feature-file.feature:scenario-name]

---

## Implementation Plan

[A short, clear description of what code will be written, which files will be created or modified, and what specific parts of the requirements this ticket delivers.]

## Acceptance Criteria

[A short, clear list of what must be true for this ticket to be considered complete. This should be derived directly from the Gherkin scenarios.]
```
