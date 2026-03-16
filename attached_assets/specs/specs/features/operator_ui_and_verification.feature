Feature: Operator UI and Verification
  To allow an operator to manage and trust the directory, the system must provide a clear, informative, and effective user interface for viewing data, registering creditors, ingesting invoices, resolving ambiguity, and verifying system behaviour.

  Background:
    Given the operator is logged in using the pre-configured account

  # ==============================================================================
  # Creditor Registration (ADR-031)
  # ==============================================================================

  Scenario: The operator registers a new platform user (creditor)
    When the operator navigates to the creditor registration form
    And they create a new platform user with the canonical name "New Creditor Corp"
    Then a new business node for "New Creditor Corp" should exist in the directory
    And its participation status should be "platform_user"
    And its verification status should be "resolved"

  # ==============================================================================
  # Q1: The Directory Data Table (ADR-025)
  # ==============================================================================

  Scenario: The operator views the main directory data table
    When the operator navigates to the directory view
    Then they should see a data table of business nodes with the columns "Canonical Name", "Participation Status", "Verification Status", "Geographical Status", "Invoice Aliases (Count)", "Company Number", "Last Seen Date", and "Invoice Count"
    And the table should be sorted by "Last Seen Date" in descending order by default

  Scenario: The operator filters the directory data table
    Given the operator is on the directory view
    When they apply a filter for "Verification Status" equals "unresolved"
    Then the table should only display business nodes with an "unresolved" verification status

  # ==============================================================================
  # Q2: The Invoice Ingestion Mechanism (ADR-026)
  # ==============================================================================

  Scenario: The operator successfully uploads an invoice file for a specific creditor
    Given a resolved platform user named "New Creditor Corp" exists
    When the operator selects "New Creditor Corp" from the creditor dropdown
    And they upload a valid CSV file named "march_invoices.csv"
    And the system finishes processing the file
    Then they should be presented with a summary report detailing the number of invoices processed, new nodes created, and new review items generated
    And after dismissing the report, the directory view should refresh to show the new data

  # ==============================================================================
  # Q3 & PI-008: The Operator Review Queue (ADR-027, ADR-028)
  # ==============================================================================

  Scenario: The operator reviews and accepts a proposed match
    Given the operator review queue contains a proposed match between "New Node Inc" and "Existing Node Corp"
    When the operator navigates to the review queue
    And selects the proposed match
    And in the side-by-side view, they click "Accept Match"
    Then the "New Node Inc" should be merged into "Existing Node Corp"
    And an audit log entry for the "NODE_MERGED" event, linked to the operator, should be created
    And the item should be removed from the pending review queue

  Scenario: The operator reviews and rejects a proposed match
    Given the operator review queue contains a proposed match between "Unrelated Biz Ltd" and "Some Other Corp"
    When the operator navigates to the review queue
    And selects the proposed match
    And in the side-by-side view, they click "Reject Match"
    Then a "do_not_match" rule should be created between the two nodes
    And an audit log entry for the operator's decision should be created
    And the item should be removed from the pending review queue

  Scenario: A "do not match" rule prevents a future review item from being created
    Given a "do_not_match" rule exists between "Unrelated Biz Ltd" and "Some Other Corp"
    When the system processes a new invoice that would otherwise create a medium-confidence match between them
    Then no new item should be created in the operator review queue for this pair

  # ==============================================================================
  # Q5: Verifying Expected and Unexpected Behaviour (ADR-029)
  # ==============================================================================

  Scenario: The operator can verify the outcome of an ingestion via the Activity Feed
    Given the operator has just uploaded the file "march_invoices.csv"
    When they navigate to the Activity Feed view
    Then they should see a recent entry summarizing the results of the "march_invoices.csv" ingestion

  Scenario: The operator can trace a manual merge via the Activity Feed
    Given an operator has just merged two nodes
    When they navigate to the Activity Feed view
    Then they should see a recent entry describing the "NODE_MERGED" event, including the operator's name and the nodes involved

  Scenario: The operator reclassifies a business node as a contact
    Given the operator review queue contains a proposed match for a node that should be a contact
    When the operator selects the item
    And in the side-by-side view, they click "Reclassify as Contact"
    Then the business node should be archived
    And a new contact entity should be created with the relevant details
    And an audit log entry for the "NODE_RECLASSIFIED" event should be created

  Scenario: The operator skips a review item
    Given the operator review queue contains a proposed match
    When the operator selects the item
    And in the side-by-side view, they click "Skip"
    Then the item should remain in the pending review queue
    And no other change should occur
