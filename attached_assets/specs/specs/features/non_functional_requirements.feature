Feature: Canary Non-Functional Requirements
  This feature describes the performance, reliability, and other non-functional
  constraints that the canary system must satisfy. These scenarios ensure that
  the system is not only functionally correct but also robust and usable under
  realistic conditions.

  Background:
    Given the system is deployed and running on the canary environment
    And the operator is authenticated

  Scenario: Ingestion of a moderately sized invoice file is performant
    Given the operator has a valid CSV file named "invoices_1000.csv" containing 1000 invoice records for the creditor "Creditor Corp"
    When the operator uploads the "invoices_1000.csv" file
    Then the ingestion process should complete and the summary report should be displayed within 10 seconds

  Scenario: Ingestion of an invoice file is atomic
    Given the operator has a malformed CSV file named "invoices_malformed.csv" that contains 5 valid rows and 1 invalid row
    When the operator uploads the "invoices_malformed.csv" file
    Then the ingestion process should fail
    And an error message indicating a processing failure is displayed to the operator
    And no new invoice records should be created in the graph

  Scenario: User-provided content is correctly escaped to prevent XSS
    Given a business node exists with the canonical_name "<script>alert(\'XSS\')</script> Malicious Corp"
    When the operator views the directory data table
    Then the text "<script>alert(\'XSS\')</script> Malicious Corp" should be visible in the table
    And no alert dialog should be displayed

  Scenario: All visible text on a page is sourced from the i18n framework
    Given the operator views the directory data table
    And the page displays the title "Business Directory"
    When the i18n locale value for the key "directory.title" is changed to "Cyfeiriadur Busnes"
    And the operator reloads the page
    Then the page should display the title "Cyfeiriadur Busnes"

  Scenario: Database schema changes are managed by a migration framework
    Given the application has started up successfully
    When the operator inspects the database schema
    Then a table for managing schema migrations should exist

  Scenario: API endpoints are versioned
    Given the application is running
    When the operator makes a GET request to "/api/v1/directory"
    Then the response status should be 200
    When the operator makes a GET request to "/directory"
    Then the response status should be 404

  Scenario: API errors are returned in a structured format
    Given the application is running
    When the operator makes a GET request to a non-existent endpoint "/api/v1/non-existent-resource"
    Then the response status should be 404
    And the response body should be a JSON object matching the structure '{"error": {"code": "NOT_FOUND", "message": "..."}}'
