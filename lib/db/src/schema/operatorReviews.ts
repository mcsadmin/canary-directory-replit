import { pgTable, text, uuid, pgEnum, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessNodes } from "./businessNodes";
import { invoices } from "./invoices";
import { operators } from "./operators";

export const reviewTypeEnum = pgEnum("review_type", ["proposed_match", "data_conflict", "contact_classification"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "accepted", "rejected"]);

export const operatorReviews = pgTable("operator_reviews", {
  reviewId: uuid("review_id").defaultRandom().primaryKey(),
  reviewType: reviewTypeEnum("review_type").notNull(),
  sourceInvoiceId: uuid("source_invoice_id").references(() => invoices.invoiceId),
  candidateNodeId: uuid("candidate_node_id").references(() => businessNodes.nodeId),
  newNodeId: uuid("new_node_id").notNull().references(() => businessNodes.nodeId),
  rawDebtorDetails: jsonb("raw_debtor_details"),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
  status: reviewStatusEnum("status").notNull().default("pending"),
  operatorId: uuid("operator_id").references(() => operators.operatorId),
  decisionTimestamp: timestamp("decision_timestamp", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOperatorReviewSchema = createInsertSchema(operatorReviews).omit({
  reviewId: true,
  createdAt: true,
});

export type InsertOperatorReview = z.infer<typeof insertOperatorReviewSchema>;
export type OperatorReview = typeof operatorReviews.$inferSelect;
