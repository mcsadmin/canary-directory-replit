import { pgTable, text, uuid, pgEnum, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessNodes } from "./businessNodes";

export const invoiceStatusEnum = pgEnum("invoice_status", ["active", "pending"]);

export const invoices = pgTable("invoices", {
  invoiceId: uuid("invoice_id").defaultRandom().primaryKey(),
  creditorNodeId: uuid("creditor_node_id").notNull().references(() => businessNodes.nodeId),
  debtorNodeId: uuid("debtor_node_id").notNull().references(() => businessNodes.nodeId),
  creditorName: text("creditor_name").notNull(),
  debtorName: text("debtor_name").notNull(),
  amountDue: numeric("amount_due", { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("active"),
  debtorAddress: text("debtor_address"),
  debtorEmail: text("debtor_email"),
  debtorCompanyNumber: text("debtor_company_number"),
  debtorVatNumber: text("debtor_vat_number"),
  debtorPostcode: text("debtor_postcode"),
  debtorWebsite: text("debtor_website"),
  debtorPhone: text("debtor_phone"),
  debtorContactName: text("debtor_contact_name"),
  batchId: uuid("batch_id"),
  ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  invoiceId: true,
  ingestedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
