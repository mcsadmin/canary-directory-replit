/**
 * Database seed script
 * Creates the operator account and seeds external_data table.
 * Run via: pnpm --filter @workspace/scripts run seed
 */

import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create operator account (ADR-031)
  const existingOp = await db
    .select()
    .from(schema.operators)
    .where(eq(schema.operators.username, "operator"))
    .limit(1);

  if (existingOp.length === 0) {
    const [op] = await db
      .insert(schema.operators)
      .values({
        username: "operator",
        passwordHash: "canary-operator-placeholder-hash",
        displayName: "Local Loop Operator",
      })
      .returning();
    console.log("Created operator:", op.username, "id:", op.operatorId);
  } else {
    console.log("Operator already exists, skipping.");
  }

  // Seed external_data table with 4 records (ADR-019, test_data_specification.md)
  // Note: Riverside Garage Ltd row added per agreement to fix missing row in external_dataset.csv
  const externalRecords = [
    {
      uuid: "20791075955290bdfddf90cc4a3f95bc" as unknown as string,
      name: "Mk Mart (Mk Mart Ltd)",
      crn: "15383077",
      address: "01 High St, Runcorn",
      postcode: "WA7 1BG",
      incorporated: "2024-01-03",
      lat: "53.34064",
      lng: "-2.73134",
      localAuthority: "E06000006",
      localAuthorityName: "Halton",
      sicDescription: "Wholesale & Retail Trade; Repair of Motor Vehicles & Motorcycles",
      desc: "Retail sale via stalls and markets of other goods",
      emps: 1,
      empsType: "Modelled",
      age: 1,
      ageType: "Reported",
      accCat: "NOT DORMANT",
      accType: "None Provided",
      companyStatus: "Active",
      dateOfAgeing: "2025-03-20",
      google: null,
      yell: null,
      chLink: null,
    },
    {
      uuid: "6774d17c25c5ccb6f4acecfdac6ab6df" as unknown as string,
      name: "Devine Cosmetics Consultancy (Devine Cosmetics Consultancy Limited)",
      crn: "12162272",
      address: "1 - 3 Salisbury Street, Widnes",
      postcode: "WA8 6PJ",
      incorporated: "2019-08-19",
      lat: "53.3673753",
      lng: "-2.7274548",
      localAuthority: "E06000006",
      localAuthorityName: "Halton",
      sicDescription: "Other Service Activities",
      desc: "Other personal service activities nec",
      emps: 2,
      empsType: "Reported",
      age: 6,
      ageType: "Reported",
      accCat: "NOT DORMANT",
      accType: "TOTAL EXEMPTION FULL",
      companyStatus: "Active - Proposal to Strike off",
      dateOfAgeing: "2025-03-20",
      google: null,
      yell: null,
      chLink: null,
    },
    {
      uuid: "bfa07fa81a04b5753a7d467143205fc5" as unknown as string,
      name: "Drive Development Solutions (Drive Development Solutions Limited)",
      crn: "08395882",
      address: "1 1 Fillmore Grove, Widnes",
      postcode: "WA8 9QF",
      incorporated: "2013-02-08",
      lat: "53.38013",
      lng: "-2.739247",
      localAuthority: "E06000006",
      localAuthorityName: "Halton",
      sicDescription: "Professional, Scientific & Technical Activities",
      desc: "Management consultancy activities (other than financial management)",
      emps: 1,
      empsType: "Reported",
      age: 12,
      ageType: "Reported",
      accCat: "NOT DORMANT",
      accType: "TOTAL EXEMPTION FULL",
      companyStatus: "Active",
      dateOfAgeing: "2025-03-20",
      google: null,
      yell: null,
      chLink: null,
    },
    // Added per agreement: missing from external_dataset.csv but specified in test_data_specification.md
    {
      uuid: "9f8e7d6c5b4a3c2d1e0f9a8b7c6d5e4f" as unknown as string,
      name: "Riverside Garage Ltd",
      crn: "87654321",
      address: "12 River Road, Runcorn",
      postcode: "WA7 9YZ",
      incorporated: "2018-05-20",
      lat: "53.33000",
      lng: "-2.74000",
      localAuthority: "E06000006",
      localAuthorityName: "Halton",
      sicDescription: "Wholesale & Retail Trade; Repair of Motor Vehicles & Motorcycles",
      desc: "Maintenance and repair of motor vehicles",
      emps: 5,
      empsType: "Reported",
      age: 7,
      ageType: "Reported",
      accCat: "NOT DORMANT",
      accType: "TOTAL EXEMPTION FULL",
      companyStatus: "Active",
      dateOfAgeing: "2025-03-20",
      google: null,
      yell: null,
      chLink: null,
    },
  ];

  for (const record of externalRecords) {
    const existing = await db
      .select()
      .from(schema.externalData)
      .where(eq(schema.externalData.crn, record.crn!))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.externalData).values(record as any);
      console.log("Seeded external record:", record.name);
    } else {
      console.log("External record already exists:", record.name);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
