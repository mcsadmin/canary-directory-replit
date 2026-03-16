import { pgTable, uuid, pgEnum, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessNodes } from "./businessNodes";

export const matchRuleTypeEnum = pgEnum("match_rule_type", ["do_not_match"]);

export const matchRules = pgTable("match_rules", {
  ruleId: uuid("rule_id").defaultRandom().primaryKey(),
  nodeIdA: uuid("node_id_a").notNull().references(() => businessNodes.nodeId),
  nodeIdB: uuid("node_id_b").notNull().references(() => businessNodes.nodeId),
  ruleType: matchRuleTypeEnum("rule_type").notNull(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("uq_match_rule_pair_type").on(table.nodeIdA, table.nodeIdB, table.ruleType),
]);

export const insertMatchRuleSchema = createInsertSchema(matchRules).omit({
  ruleId: true,
  createdAt: true,
});

export type InsertMatchRule = z.infer<typeof insertMatchRuleSchema>;
export type MatchRule = typeof matchRules.$inferSelect;
