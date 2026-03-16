Feature: Directory Accuracy
  To ensure the directory is accurate, the system must prioritize the avoidance of false positives over the elimination of false negatives.

  Background:
    Given the system is configured with an Upper Confidence Threshold of 80 and a Lower Confidence Threshold of 20

  # ==============================================================================
  # Match Threshold Logic (ADR-022, ADR-013)
  # ==============================================================================

  Scenario: A high-confidence match correctly merges with an existing node
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module returns a score of 95 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that are a high-confidence match
    Then the invoice must be linked to the existing "Bobs Coffee House" node
    And the directory must contain only one business node for "Bobs Coffee House"

  Scenario: A low-confidence match correctly creates a duplicate node by design
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module returns a score of 10 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that are a low-confidence match
    Then a new "third_party" record with "unresolved" status must be created
    And the directory must contain two separate business nodes
    And no item should be created in the operator review queue

  Scenario: A medium-confidence match correctly creates a new node and a review item
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module returns a score of 50 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that are a medium-confidence match
    Then a new "third_party" record with "unresolved" status must be created
    And the directory must contain two separate business nodes
    And an item must be created in the operator review queue to review the potential match

  # ==============================================================================
  # Protection of Resolved Data (ADR-022)
  # ==============================================================================

  Scenario: Conflicting authoritative data does not automatically overwrite a resolved node's attributes
    Given a "resolved" business named "Acme Ltd" with company number "11111111" exists
    When the system processes an invoice for "Acme Ltd" that is a high-confidence name match but has a conflicting company number "22222222"
    Then the existing "Acme Ltd" node must not be modified
    And a new "unresolved" business node must be created for the debtor from the new invoice
    And an item must be created in the operator review queue to review the conflict between the two nodes
