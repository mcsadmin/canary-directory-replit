import { pgTable, text, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessNodes } from "./businessNodes";

export const invoiceAliases = pgTable("invoice_aliases", {
  aliasId: uuid("alias_id").defaultRandom().primaryKey(),
  businessNodeId: uuid("business_node_id").notNull().references(() => businessNodes.nodeId),
  creditorNodeId: uuid("creditor_node_id").notNull().references(() => businessNodes.nodeId),
  aliasText: text("alias_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("uq_alias_business_creditor_text").on(table.businessNodeId, table.creditorNodeId, table.aliasText),
]);

export const insertInvoiceAliasSchema = createInsertSchema(invoiceAliases).omit({
  aliasId: true,
  createdAt: true,
});

export type InsertInvoiceAlias = z.infer<typeof insertInvoiceAliasSchema>;
export type InvoiceAlias = typeof invoiceAliases.$inferSelect;
