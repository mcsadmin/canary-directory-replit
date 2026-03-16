Feature: Invoice Ingestion
  This feature describes how the system ingests invoice data from a creditor to populate the invoice graph.
  Each CSV file submitted for ingestion contains invoices from a single creditor only (ADR-004).
  All ingested data is assumed to be valid (ADR-003).

  Background:
    Given "Creditor Corp" is a "platform_user" with "resolved" status

  Scenario: A creditor submits a single invoice
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due
      Creditor Corp,Customer A,100.00
      """
    When the file is uploaded
    Then the system creates 1 new invoice record in the invoice graph
    And the invoice record has a UUID
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer A", and amount due 100.00

  Scenario: A creditor submits multiple invoices to multiple debtors
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due
      Creditor Corp,Customer A,100.00
      Creditor Corp,Customer B,250.50
      Creditor Corp,Customer C,75.25
      """
    When the file is uploaded
    Then the system creates 3 new invoice records in the invoice graph
    And each of the 3 new invoice records has a UUID
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer A", and amount due 100.00
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer B", and amount due 250.50
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer C", and amount due 75.25

  Scenario: A creditor submits multiple invoices to the same debtor
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due
      Creditor Corp,Customer A,100.00
      Creditor Corp,Customer A,200.00
      """
    When the file is uploaded
    Then the system creates 2 new invoice records in the invoice graph
    And each of the 2 new invoice records has a UUID
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer A", and amount due 100.00
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer A", and amount due 200.00

  Scenario: A creditor submits an empty CSV file
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due
      """
    When the file is uploaded
    Then the system creates 0 new invoice records in the invoice graph
    And no error is raised

  Scenario: A creditor submits an invoice with a zero amount due
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due
      Creditor Corp,Customer A,0.00
      """
    When the file is uploaded
    Then the system creates 1 new invoice record in the invoice graph
    And the invoice record has a UUID
    And an invoice record exists with creditor "Creditor Corp", debtor "Customer A", and amount due 0.00

  Scenario: An invoice with optional data fields is processed correctly
    Given a CSV file is prepared for upload by "Creditor Corp" with the following content:
      """
      creditor_name,debtor_name,amount_due,debtor_address,debtor_company_number
      Creditor Corp,Optional Debtor,750.00,"1 Optional Lane, Optville",98765432
      """
    When the file is uploaded
    Then 1 new invoice record should be created in the main invoice graph
    And the new invoice record should have a debtor_address of "1 Optional Lane, Optville"
    And the new invoice record should have a debtor_company_number of "98765432"
