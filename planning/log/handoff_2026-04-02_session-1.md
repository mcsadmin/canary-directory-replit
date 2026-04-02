# Handoff Note — Session 1: Name Normaliser Requirements Elicitation

**Date:** 2 April 2026  
**Session:** Session 1 — Name Normaliser Requirements Elicitation  
**Structured by:** Project Coaching Agent

---

## What Was Decided

- The seven requirements questions for the Name Normaliser module were agreed as the correct and complete scope for the requirements agent session. The questions cover: case/whitespace rules, punctuation handling, UK legal form standardisation, stop word policy, idempotency, edge cases, and test coverage.
- Requirements Brief `RB-NN` has been produced and committed to `planning/RB-NN_name_normaliser_implementation.md`.
- The brief has been pushed to the remote repository (`canary-directory-replit`, master branch, commit `3cde5a4`).

## What Was Parked

- Nothing. All items in scope were addressed.

## What the Next Session Needs to Address

- Review the artefacts returned by the requirements agent (ADR amendment or new ADR, Gherkin scenarios, data dictionary note if applicable).
- Conduct a sufficiency assessment against the brief: have all seven questions been answered? Are the artefacts internally consistent? Are there any gaps?
- Obtain human sign-off before proceeding to the coding agent handoff package.

---

## Implications (Coaching Agent Note)

The requirements agent session should be run with the six context files listed in the brief. The sufficiency criterion is strict: a coding agent must be able to implement the module from the returned artefacts without asking clarifying questions. If the returned artefacts are thin on edge cases or test coverage, a further requirements pass will be needed before the handoff gate can be opened.
