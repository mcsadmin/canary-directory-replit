import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditEvents = pgTable("audit_events", {
  eventId: uuid("event_id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  entityId: uuid("entity_id"),
  entityType: text("entity_type"),
  payload: jsonb("payload"),
  operatorId: uuid("operator_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditEventSchema = createInsertSchema(auditEvents).omit({
  eventId: true,
  createdAt: true,
});

export type InsertAuditEvent = z.infer<typeof insertAuditEventSchema>;
export type AuditEvent = typeof auditEvents.$inferSelect;
