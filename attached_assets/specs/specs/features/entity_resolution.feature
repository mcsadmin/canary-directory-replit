Feature: Entity Resolution and Directory Management
  To build a robust, accurate, and reliable graph of local invoices, the system must intelligently process invoice data, manage business and contact identities, and maintain data quality over time.

  Background:
    Given the platform's catchment area is defined by a set of coordinates

  # ==============================================================================
  # Core Entity Resolution Logic (ADR-005, ADR-006, ADR-009, ADR-010)
  # ==============================================================================

  Scenario: A new, unmatchable business is discovered through an invoice
    Given "Creditor Corp" is a "platform_user" with "resolved" status
    And the details for "New Debtor Ltd" do not match any existing records
    When the system processes an invoice from "Creditor Corp" to "New Debtor Ltd"
    Then the directory should contain a new "third_party" business record for "New Debtor Ltd" with "unresolved" status
    And a new invoice should be recorded between "Creditor Corp" and the new record for "New Debtor Ltd"

  # ==============================================================================
  # Contact and Business Distinction (ADR-011)
  # ==============================================================================

  Scenario: An invoice is processed for a named person at a known business
    Given a "resolved" business named "Jones & Sons Plumbers" exists at "123 Main Street"
    When the system processes an invoice with debtor name "Mr. Dave Jones" and address "123 Main Street"
    Then a new Contact record for "Mr. Dave Jones" should be created
    And the Contact "Mr. Dave Jones" should be linked to the Business Node "Jones & Sons Plumbers"
    And the invoice should be recorded against the Business Node "Jones & Sons Plumbers"

  Scenario: An invoice is processed for a named person with an ambiguous business link
    Given a "resolved" business named "Acme Ltd" exists
    And an invoice has been received for debtor "Jane Smith" with email "jane.smith@acme.com"
    When the entity resolution process runs for the invoice concerning "Jane Smith"
    Then a new Contact record for "Jane Smith" should be created
    And a new "third_party" Business Node for "Jane Smith" with "unresolved" status should be created
    And the Contact "Jane Smith" should be linked to the new Business Node "Jane Smith"
    And the system should flag a potential link between the Contact "Jane Smith" and the Business Node "Acme Ltd" for operator review
    And the invoice should be recorded against the new Business Node "Jane Smith"

  # ==============================================================================
  # Handling Ambiguous and Incomplete Data (ADR-006, ADR-013)
  # ==============================================================================

  Scenario: A debtor name is a high-confidence match for an existing business
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module is configured to return a score of 85 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that match "Bobs Coffee House"
    Then the directory should contain only one entry for "Bobs Coffee House"
    And the invoice should be recorded against "Bobs Coffee House"
    And the record for "Bobs Coffee House" should be enriched with any new aliases from the invoice

  Scenario: A debtor name is a medium-confidence match for an existing business
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module is configured to return a score of 50 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that match "Bobs Coffee House"
    Then a new "third_party" record with "unresolved" status should be created
    And the new record should be flagged for review against "Bobs Coffee House"
    And the invoice should be recorded against the new record

  Scenario: A debtor name is a low-confidence match for an existing business
    Given a "resolved" business named "Bobs Coffee House" exists
    And the Matching Module is configured to return a score of 10 for a match against "Bobs Coffee House"
    When the system processes an invoice for a debtor with details that match "Bobs Coffee House"
    Then a new "third_party" record with "unresolved" status should be created
    And the new record should not be flagged for review
    And the invoice should be recorded against the new record

  # ==============================================================================
  # Auditing (ADR-012)
  # ==============================================================================

  Scenario: All match attempts are logged for traceability and review
    Given the system is processing an invoice with ID "ffc3a35d-4943-45c9-8b83-6e21e9015c65" for a debtor named "Final Widgets"
    When the entity resolution process completes
    Then an audit log entry must be created for the attempt
    And the log must include the raw debtor details, all candidates considered, their confidence scores, and the final outcome


  # ==============================================================================
  # Entity Lifecycle and State Transitions (ADR-009)
  # ==============================================================================

  Scenario: A new user registers for the platform with no prior history
    Given a new user signs up for the platform with the name "New User Inc."
    When the registration is complete
    Then a new "platform_user" record for "New User Inc." should be created with "unresolved" status

  Scenario: An existing third-party entity registers for the platform
    Given a "third_party" entity for "Existing Debtor Ltd" exists with "unresolved" status
    And this entity has existing invoices and invoice aliases attached to it
    When a new user registers providing details that are a high-confidence match for "Existing Debtor Ltd"
    Then the existing record for "Existing Debtor Ltd" should be updated to "platform_user"
    And its verification status should remain "unresolved"
    And a new separate record should not be created
    And all existing invoices and aliases should remain attached to the record

  Scenario: A platform user's identity is resolved by an operator
    Given a "platform_user" named "User Corp" exists with "unresolved" status
    When an operator confirms the identity of "User Corp" against a trusted source
    Then the verification status for "User Corp" should be updated to "resolved"

  Scenario: An operator merges a duplicate third-party record into a resolved one
    Given a business named "Bobs Coffee House" exists as a "third_party" with "resolved" status
    And a separate business named "Bob's Cafe" exists as a "third_party" with "unresolved" status
    And each record has its own set of invoices and aliases
    When an operator merges the "unresolved" record for "Bob's Cafe" into the "resolved" record for "Bobs Coffee House"
    Then the record for "Bobs Coffee House" should be enriched with all invoices and aliases from the "Bob's Cafe" record
    And the "unresolved" record for "Bob's Cafe" should be removed or archived
    And all future invoices referencing aliases of "Bob's Cafe" should resolve to "Bobs Coffee House"

  Scenario: An operator rejects a proposed entity merge
    Given the system has proposed merging entity "A" and entity "B"
    When an operator reviews the proposal and rejects the merge, confirming they are distinct entities
    Then a "do not match" rule should be created between entity "A" and entity "B"

  Scenario: An invoice is processed with conflicting authoritative data
    Given a business named "Acme Ltd" with company number "11111111" exists with "resolved" status
    When the system processes an invoice for a debtor named "Widget Inc." with company number "11111111"
    Then a new "third_party" record for "Widget Inc." with "unresolved" status should be created
    And the new record should be flagged for immediate review due to the data conflict
    And the invoice should be recorded against the new record


  # ==============================================================================
  # Geographical Classification (ADR-014)
  # ==============================================================================

  Scenario: A new business is classified as local
    Given the system processes a new business with an address inside the catchment area
    When the geographical classification process runs
    Then its geographical status should be set to "local"

  Scenario: A new business is classified as remote
    Given the system processes a new business with an address outside the catchment area
    When the geographical classification process runs
    Then its geographical status should be set to "remote"

  Scenario: A new business has an uncertain location
    Given the system processes a new business with no address information
    When the geographical classification process runs
    Then its geographical status should be set to "uncertain"


  # ==============================================================================
  # Canonical Name Assignment (ADR-015)
  # ==============================================================================

  Scenario: A new business node's canonical name is assigned by the dedicated module
    Given the system processes a new business with the names "Bob's Cafe" and "Bobs Coffee House"
    And the Canonical Name Module is configured to select "Bobs Coffee House"
    When the canonical name assignment process runs
    Then its canonical_name should be set to "Bobs Coffee House"


  # ==============================================================================
  # Operator Review Queue (ADR-016)
  # ==============================================================================

  Scenario: A medium-confidence match creates a review queue item
    Given a "resolved" business named "Bobs Coffee House" exists
    And the system processes an invoice for a debtor whose details are a medium-confidence match for "Bobs Coffee House"
    When the entity resolution process completes
    Then a new item should be added to the operator review queue
    And the item should contain the details of the new record and the proposed match

  Scenario: An operator accepts a proposed match
    Given an item exists in the review queue to merge "New Record" into "Existing Record"
    When an operator accepts the proposed match
    Then the two records should be merged
    And the operator's decision should be recorded in the audit trail

  Scenario: An operator rejects a proposed match
    Given an item exists in the review queue to merge "New Record" into "Existing Record"
    When an operator rejects the proposed match
    Then a "do not match" rule should be created between the two records
    And the operator's decision should be recorded in the audit trail


  # ==============================================================================
  # Creditor Verification (ADR-018)
  # ==============================================================================

  Scenario: An invoice file from an unresolved creditor is held in a pending state
    Given "Unresolved Corp" is a "platform_user" with "unresolved" status
    When "Unresolved Corp" uploads an invoice file containing 2 invoices
    Then 0 new invoice records should be created in the main invoice graph
    And 2 invoice records should be created with a "pending" status, linked to "Unresolved Corp"
    And the system should provide a message explaining that the invoices are pending verification


  # ==============================================================================
  # External Dataset Integration (ADR-019)
  # ==============================================================================

  Scenario: A new business is verified via the external dataset
    Given the internal directory has no match for "External Debtor Ltd"
    And the external dataset contains a high-confidence match for "External Debtor Ltd"
    When the system processes an invoice for "External Debtor Ltd"
    Then a new "third_party" record for "External Debtor Ltd" should be created with "resolved" status
    And the invoice should be recorded against the new record


  # ==============================================================================
  # Integrity Check Scenarios (ADR-010, ADR-011, ADR-017)
  # ==============================================================================

  Scenario: Optional invoice fields are correctly ingested and stored
    Given a resolved creditor uploads an invoice with optional fields like company number "12345678"
    When the entity resolution process runs
    Then the corresponding Business Node should have the company number "12345678" stored against it

  Scenario: An operator reclassifies an entity from a business to a contact
    Given a "third_party" Business Node for "Dave Smith" exists
    And an operator determines this entity is actually a person
    When the operator reclassifies the entity
    Then the Business Node for "Dave Smith" should be removed or archived
    And a new Contact record for "Dave Smith" should be created

  Scenario: The name normalisation process is applied correctly
    Given the Name Normalisation Module is configured to normalise "Bob's Cafe Co." to "bobs cafe company"
    When the system processes an invoice for a debtor named "Bob's Cafe Co."
    Then the matching process should be performed using the normalised name "bobs cafe company"
