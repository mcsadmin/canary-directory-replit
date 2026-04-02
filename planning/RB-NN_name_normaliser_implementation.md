# Requirements Brief: Name Normaliser Implementation Specification

**Date:** 2 April 2026  
**Issued to:** Requirements Coaching Agent  
**Status:** Open

---

## Abstract

This brief commissions a requirements session to produce a complete, testable specification for the Name Normaliser module in the Canary Directory project. The module interface is already defined in ADR-017, and a high-level functional description exists in the working brief. This session must resolve the specific transformation rules, edge cases, and test coverage requirements so that a coding agent can implement the module without ambiguity.

---

## RACI Matrix

| Role | Party |
|---|---|
| Responsible | Requirements Coaching Agent |
| Accountable | Tom and Dil (human team) |
| Consulted | Project Coaching Agent |
| Informed | N/A |

---

## Scope of This Requirements Group

This requirements group covers the **implementation specification** for the Name Normaliser module only. It does not cover:

- The interface definition (already resolved in ADR-017)
- The matching module, geo classifier, or any other entity resolution component
- Integration testing with the wider entity resolution pipeline
- Deployment or performance tuning

The output of this session will be a set of Gherkin scenarios and/or an ADR amendment that specifies the exact transformation rules the normaliser must apply.

---

## Dependency Context

The requirements agent must read the following artefacts before starting:

1. **ADR-017: Name Normalisation Rules** (`/home/ubuntu/specs_upload/specs/adrs/rb002/ADR-017_Name_Normalisation_Rules.md`)
2. **Working Brief: Name Normaliser Service** (`/home/ubuntu/upload/WorkingBrief_NameNormaliserService.md`)
3. **Preflight Document: Name Normaliser Service** (`/home/ubuntu/upload/PreflightDocument_NameNormaliserService.md`)
4. **Feature file: entity_resolution.feature** (specifically Scenario: "The name normalisation process is applied correctly") (`/home/ubuntu/specs_upload/specs/features/entity_resolution.feature`)
5. **Data Dictionary (RB-002)** (`/home/ubuntu/specs_upload/specs/data_dictionary/data_dictionary_rb002.md`)

---

## Questions to Answer

The requirements session must resolve the following seven questions:

### Q1. Case and Whitespace Rules
- Confirm: Convert to lowercase, collapse multiple spaces to single space, trim leading/trailing whitespace?
- Are there any exceptions or edge cases?

### Q2. Punctuation Handling
- Which punctuation marks should be removed entirely? (e.g., apostrophes, periods, commas, quotation marks)
- Which should be transformed? (e.g., ampersand "&" → "and", hyphen → space)
- Should punctuation at the end of the string be treated differently from punctuation in the middle?
- How should we handle multiple consecutive punctuation marks?

### Q3. UK Legal Form Standardisation
- What is the complete, authoritative list of UK legal forms and their abbreviations to strip?
- Should these be stripped only when they appear at the end of the name, or anywhere in the string?
- Should the stripping be case-insensitive?
- Should we handle bracketed forms? (e.g., "Bob's Cafe (Ltd)")
- Should we handle forms with periods? (e.g., "Ltd.", "P.L.C.")
- What is the order of operations? (e.g., strip punctuation first, then legal forms? Or vice versa?)

### Q4. Stop Words
- Should common stop words (e.g., "the", "and", "of") be removed?
- If yes, what is the complete list?
- If no, should we explicitly document this decision as a constraint?

### Q5. Idempotency
- Confirm: `normalise(normalise(x)) == normalise(x)` must hold for all inputs?
- Are there any edge cases where this might not hold?
- How should the test suite verify idempotency?

### Q6. Edge Cases
- How should the function handle:
  - Empty string (`""`)
  - Null or undefined input
  - Whitespace-only input (`"   "`)
  - Very long strings (e.g., > 1000 characters)
  - Non-ASCII characters (e.g., accented characters, emoji)
  - Strings with no letters (e.g., "123", "!!!")

### Q7. Test Coverage
- The feature scenario gives us one test case: "Bob's Cafe Co." → "bobs cafe company"
- What additional test cases must the Vitest suite cover to be considered sufficient?
- Should we have test cases for each legal form variant?
- Should we have test cases for each punctuation rule?
- Should we have test cases for idempotency and edge cases?

---

## Expected Outputs

The requirements session must produce:

1. **A new ADR or an amendment to ADR-017** that specifies:
   - The complete list of transformation rules (case, punctuation, legal forms, whitespace)
   - The order of operations
   - The handling of edge cases
   - The idempotency guarantee

2. **A set of Gherkin scenarios** (either as a new feature file or as additional scenarios in `entity_resolution.feature`) that cover:
   - The existing feature scenario ("Bob's Cafe Co." → "bobs cafe company")
   - At least 10–15 additional test cases covering all transformation rules and edge cases
   - Idempotency verification

3. **An update to the data dictionary** (if needed) to document any constraints on the `canonical_name` field or the normalisation process

---

## Sufficiency Test

This requirements group will be considered complete when:

1. All seven questions have been answered with specific, testable rules
2. The ADR/amendment contains a complete, unambiguous specification of the normalisation algorithm
3. The Gherkin scenarios cover all transformation rules and edge cases
4. A human reviewer (Tom or Dil) can read the ADR and scenarios and confidently say: "A coding agent can implement this module from these artefacts without needing to ask clarifying questions"
5. The artefacts pass the integrity check: no contradictions between the ADR, the scenarios, and the data dictionary

---

## Notes

- **Testing mandate:** The preflight document and coding agent rules mandate Vitest as the test framework. The requirements artefacts should be written with this in mind (i.e., scenarios should be directly translatable to Vitest test cases).
- **No external dependencies:** The working brief explicitly forbids heavy NLP libraries. The normalisation logic must use standard TypeScript/JavaScript string methods and regular expressions only.
- **Performance consideration:** The normalisation function will be called frequently. The specification should avoid rules that require expensive operations (e.g., multiple passes over the string, complex regex backtracking).
