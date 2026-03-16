import { pgTable, text, uuid, pgEnum, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const participationStatusEnum = pgEnum("participation_status", ["platform_user", "third_party"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unresolved", "resolved"]);
export const geographicalStatusEnum = pgEnum("geographical_status", ["local", "remote", "uncertain"]);

export const businessNodes = pgTable("business_nodes", {
  nodeId: uuid("node_id").defaultRandom().primaryKey(),
  canonicalName: text("canonical_name").notNull().default(""),
  participationStatus: participationStatusEnum("participation_status").notNull(),
  verificationStatus: verificationStatusEnum("verification_status").notNull(),
  geographicalStatus: geographicalStatusEnum("geographical_status").notNull().default("uncertain"),
  companyNumber: text("company_number").unique(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBusinessNodeSchema = createInsertSchema(businessNodes).omit({
  nodeId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessNode = z.infer<typeof insertBusinessNodeSchema>;
export type BusinessNode = typeof businessNodes.$inferSelect;
