# Data Dictionary

This document is the authoritative reference for all data entities and attributes in the system. It is maintained by the requirements coaching agent and is always consistent with the accepted ADRs.

---

## Invoice Entity

**Source ADR:** [ADR-010: Extended Invoice Data Model](RB-002/ADR-010_Extended_Invoice_Data_Model.md)

| Attribute | Data Type | Presence | Description |
|---|---|---|---|
| `invoice_id` | UUID | Mandatory | A UUID assigned by the system upon ingestion. Guarantees every invoice can be uniquely referenced. |
| `creditor_name` | string | Mandatory | The name of the creditor (supplier) as it appears on the invoice. |
| `debtor_name` | string | Mandatory | The name of the debtor (customer) as it appears on the invoice. |
| `amount_due` | number | Mandatory | The amount outstanding at the present time. |
| `debtor_address` | string | Optional | The debtor's address, if present on the invoice. Used as a signal for entity resolution. |
| `debtor_email` | string | Optional | The debtor's email address, if present on the invoice. Used as a signal for entity resolution. |
| `debtor_company_number` | string | Optional | The debtor's company number, if present. A strong signal for entity resolution. |
| `debtor_vat_number` | string | Optional | The debtor's VAT number, if present. A strong signal for entity resolution. |
| `debtor_postcode` | string | Optional | The debtor's postcode, if present. A strong signal for geographical classification. |
| `debtor_website` | string | Optional | The debtor's website address, if present. A signal for entity resolution. |
| `debtor_phone` | string | Optional | The debtor's phone number, if present. A signal for entity resolution. |
| `debtor_contact_name` | string | Optional | The name of a specific person at the debtor business, if present. A strong signal for Contact entity creation (ADR-007). |

---

## Business Node Entity

**Source ADRs:** [ADR-007: Business Node Data Model](RB-002/ADR-007_Business_Node_Data_Model.md), [ADR-009: Decoupled Entity Status Model](RB-002/ADR-009_Decoupled_Entity_Status.md)

| Attribute | Data Type | Description |
|---|---|---|
| `node_id` | UUID | A UUID assigned by the system upon creation. Uniquely identifies the business node internally. |
| `canonical_name` | string | A single, clean, and unambiguous name for the entity, managed by the system and its operators. |
| `participation_status` | ENUM (`platform_user`, `third_party`) | Describes the entity's relationship with the Local Loop platform. |
| `verification_status` | ENUM (`unresolved`, `resolved`) | Describes the system's confidence in the entity's real-world identity. |
| `invoice_aliases` | array of objects | A list of all idiosyncratic names used to refer to this entity on invoices. Each entry is an object: `{ alias_name: string, source_creditor_id: UUID }`, linking the alias to the creditor who used it. See IR-10 resolution. |
| `non_invoice_aliases` | array of strings | A list of other known names for the entity (e.g., legal names, trading names). |
| `geographical_status` | ENUM (`local`, `remote`, `uncertain`) | Describes the entity's location relative to the platform's catchment area. |
| `company_number` | string | The entity's official company number, if known. A strong signal for matching. |

---

## Contact Entity

**Source ADR:** [ADR-011: Contact Entity Model](RB-002/ADR-011_Contact_Entity_Model.md)

| Attribute | Data Type | Description |
|---|---|---|
| `contact_id` | UUID | A UUID assigned by the system upon creation. Uniquely identifies the contact internally. |
| `full_name` | string | The full name of the individual. |
| `email` | string | The contact's email address. |
| `linked_business_nodes` | array of objects | A list of objects, each containing a `node_id` and a `role` string (e.g., { "node_id": "...", "role": "Director" }). |

---

## Operator Review Entity

**Source ADR:** [ADR-016: Operator Review Queue](RB-002/ADR-016_Operator_Review_Queue.md)

| Attribute | Data Type | Description |
|---|---|---|
| `review_id` | UUID | A unique identifier for the review item. |
| `review_type` | ENUM | The category of decision required (e.g., `proposed_match`, `data_conflict`, `contact_classification`). |
| `source_invoice_id` | UUID | The invoice that triggered the review. |
| `candidate_node_id` | UUID | The existing node the system is proposing to match against (if applicable). |
| `new_node_id` | UUID | The new, unresolved node created pending the review. |
| `raw_debtor_details` | JSONB | The original debtor data from the invoice. |
| `confidence_score` | number | The score that placed this item in the review queue. |
| `status` | ENUM | The current state of the review item (`pending`, `accepted`, `rejected`). |
| `operator_id` | UUID | The ID of the operator who made the decision. |
| `decision_timestamp` | timestamp | The time the decision was made. |

---

## Audit Log Entity

**Source ADR:** [ADR-012: Audit Trail Requirements](RB-002/ADR-012_Audit_Trail_Requirements.md)

| Attribute | Data Type | Description |
|---|---|---|
| `log_id` | UUID | A unique identifier for the audit log entry. |
| `source_invoice_id` | UUID | The unique ID of the source invoice. |
| `raw_debtor_details` | JSONB | The raw `debtor_name` and any other debtor-related fields from the invoice. |
| `candidates` | array of objects | A list of all candidate `Business Node` entities considered, each with their `node_id` and calculated `confidence_score`. |
| `outcome` | string | The final outcome of the resolution (e.g., `matched_to_node_x`, `new_node_y_created`, `flagged_for_review`). |
| `timestamp` | timestamp | The timestamp for the resolution event. |
