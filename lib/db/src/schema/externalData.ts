import { pgTable, text, uuid, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const externalData = pgTable("external_data", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  crn: text("crn"),
  address: text("address"),
  postcode: text("postcode"),
  incorporated: text("incorporated"),
  lat: numeric("lat", { precision: 12, scale: 7 }),
  lng: numeric("lng", { precision: 12, scale: 7 }),
  localAuthority: text("local_authority"),
  localAuthorityName: text("local_authority_name"),
  sicDescription: text("sic_description"),
  desc: text("desc"),
  emps: integer("emps"),
  empsType: text("emps_type"),
  age: integer("age"),
  ageType: text("age_type"),
  accCat: text("acc_cat"),
  accType: text("acc_type"),
  companyStatus: text("company_status"),
  dateOfAgeing: text("date_of_ageing"),
  google: text("google"),
  yell: text("yell"),
  chLink: text("ch_link"),
});

export const insertExternalDataSchema = createInsertSchema(externalData).omit({ uuid: true });
export type InsertExternalData = z.infer<typeof insertExternalDataSchema>;
export type ExternalData = typeof externalData.$inferSelect;
