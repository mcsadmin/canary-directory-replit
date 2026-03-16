Feature: Directory Traceability
  To ensure the directory is auditable and debuggable, every event that creates or modifies a business node must be recorded in an immutable audit trail.

  Background:
    Given the system is configured with the standard set of confidence thresholds and modules

  # ==============================================================================
  # Complete Event Logging (ADR-024)
  # ==============================================================================

  Scenario: A node creation event is recorded in the audit trail
    When the system processes an invoice for a new debtor "Traceable Toys Inc."
    Then a new business node is created for "Traceable Toys Inc."
    And an audit log entry must be created for the "NODE_CREATED" event
    And the log entry must contain the new node's ID and the source invoice ID

  Scenario: An operator's merge decision is fully traceable
    Given a "resolved" business "Node A" exists
    And an "unresolved" business "Node B" exists
    When an operator merges "Node B" into "Node A"
    Then an audit log entry must be created for the "NODE_MERGED" event
    And the log entry must contain the IDs of both source nodes ("Node A", "Node B"), the operator's ID, and the timestamp

  Scenario: A manual change in verification status is traceable
    Given a "resolved" business named "Acme Ltd" exists
    When an operator reverts the status of "Acme Ltd" to "unresolved" via a review queue decision
    Then an audit log entry must be created for the "STATUS_CHANGED" event
    And the log entry must reference the operator ID and the review queue item that triggered the change
    And the log entry must record the old status ("resolved") and the new status ("unresolved")

  # ==============================================================================
  # Immutable Audit Trail (ADR-024)
  # ==============================================================================

  Scenario: The system prevents modification of an audit log entry
    Given an audit log entry with ID "log-entry-uuid" exists
    When an application process attempts to modify the content of the audit log entry "log-entry-uuid"
    Then the operation must be rejected
    And the original audit log entry must remain unchanged
