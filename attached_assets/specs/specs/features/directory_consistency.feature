Feature: Directory Consistency
  To ensure the structural integrity of the business directory, the system must enforce a set of consistency constraints at all times.

  Background:
    Given the system is configured with the standard set of confidence thresholds and modules

  # ==============================================================================
  # Uniqueness Constraints (ADR-021)
  # ==============================================================================

  Scenario: The system prevents the creation of a new node that violates company number uniqueness
    Given a "resolved" business named "Acme Ltd" with company number "11111111" exists
    When the system processes an invoice for a new debtor "Acme Services" that is a low-confidence name match but has the same company number "11111111"
    Then a new node must not be created
    And an item must be created in the operator review queue to review the conflict between the new invoice and the existing node

  Scenario: The system prevents an operator merge that would create a company number conflict
    Given a "resolved" business named "Acme Ltd" with company number "11111111" exists
    And an "unresolved" business named "Widget Inc." with company number "22222222" exists
    When an operator attempts to merge "Widget Inc." into "Acme Ltd" and set the company number to "11111111"
    Then the merge operation should be rejected
    And the directory should still contain two separate businesses

  # ==============================================================================
  # Completeness Constraints (ADR-021)
  # ==============================================================================

  Scenario: A new business node created only from invoice aliases has an empty canonical name
    Given the system processes an invoice for a debtor named "DEBTOR-ALIAS-ONLY"
    And "DEBTOR-ALIAS-ONLY" does not match any existing records or external data
    And the Canonical Name Module returns an empty string for this case
    When the new business node is created
    Then its canonical_name attribute must be an empty string
    And the name "DEBTOR-ALIAS-ONLY" must be stored as an invoice alias for the new node

  Scenario: A new business node created from an external match has a non-empty canonical name
    Given a matching record for "External Corp" exists in the external private dataset
    And the Canonical Name Module returns "External Corporation" for this entity
    When the system processes an invoice for "External Corp"
    Then a new "resolved" business node should be created
    And its canonical_name attribute must be "External Corporation"

  # ==============================================================================
  # Referential Integrity Constraints (ADR-021)
  # ==============================================================================

  Scenario: An invoice cannot be created with a link to a non-existent creditor
    When the system attempts to ingest an invoice from a creditor with node_id "non-existent-uuid"
    Then the operation must be rejected
    And no new invoice record should be created

  # ==============================================================================
  # State Transition Constraints (ADR-021)
  # ==============================================================================

  Scenario: An operator can revert a resolved entity to unresolved
    Given a "resolved" business named "Acme Ltd" exists
    When an operator with appropriate permissions explicitly reverts the verification status of "Acme Ltd"
    Then the verification_status of "Acme Ltd" must be changed to "unresolved"
    And an audit log entry must be created for this manual state change
