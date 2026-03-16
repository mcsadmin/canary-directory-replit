import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessNodes } from "./businessNodes";

export const ingestionBatches = pgTable("ingestion_batches", {
  batchId: uuid("batch_id").defaultRandom().primaryKey(),
  creditorNodeId: uuid("creditor_node_id").notNull().references(() => businessNodes.nodeId),
  filename: text("filename").notNull(),
  totalRows: integer("total_rows").notNull().default(0),
  newInvoices: integer("new_invoices").notNull().default(0),
  pendingInvoices: integer("pending_invoices").notNull().default(0),
  newNodes: integer("new_nodes").notNull().default(0),
  newReviewItems: integer("new_review_items").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIngestionBatchSchema = createInsertSchema(ingestionBatches).omit({
  batchId: true,
  createdAt: true,
});

export type InsertIngestionBatch = z.infer<typeof insertIngestionBatchSchema>;
export type IngestionBatch = typeof ingestionBatches.$inferSelect;
