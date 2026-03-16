Feature: Directory Reliability (Determinism)
  To ensure the directory is reliable, its state must be the deterministic result of the inputs it has processed, independent of the order of operations.

  Background:
    Given the system is configured with the standard set of confidence thresholds and modules

  # ==============================================================================
  # Order-Independent Resolution (ADR-023)
  # ==============================================================================

  Scenario: Entity resolution is order-independent
    Given two invoice files, File A and File B, are prepared
    And File A contains an invoice for a new business "Orchid Services"
    And File B contains an invoice for "Orchid Services Ltd", which is a high-confidence match for "Orchid Services"
    When the system first processes File A and then processes File B
    Then the directory must contain exactly one business node for "Orchid Services"
    And both invoices must be linked to that single node

  Scenario: Entity resolution is order-independent (reversed)
    Given two invoice files, File A and File B, are prepared
    And File A contains an invoice for a new business "Orchid Services"
    And File B contains an invoice for "Orchid Services Ltd", which is a high-confidence match for "Orchid Services"
    When the system first processes File B and then processes File A
    Then the directory must contain exactly one business node for "Orchid Services"
    And both invoices must be linked to that single node
