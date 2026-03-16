/**
 * External Data Module (ADR-019)
 *
 * Interface: findExternalMatch(details, db) -> ExternalRecord | null
 *
 * Canary implementation: queries the external_data Postgres table.
 * For the canary, matches by company_number (CRN) only when provided.
 * Normalised name matching against external data is a stub returning null.
 */

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@workspace/db/schema";

export interface DebtorDetails {
  name: string;
  normalisedName: string;
  address?: string | null;
  postcode?: string | null;
  companyNumber?: string | null;
  email?: string | null;
}

export interface ExternalRecord {
  name: string;
  crn?: string | null;
  address?: string | null;
  postcode?: string | null;
  lat?: string | null;
  lng?: string | null;
  companyStatus?: string | null;
}

/**
 * Attempts to find a high-confidence match in the external dataset.
 * Canary: matches by CRN if provided, otherwise returns null.
 */
export async function findExternalMatch(
  details: DebtorDetails,
  db: NodePgDatabase<typeof schema>,
): Promise<ExternalRecord | null> {
  // Only match via company registration number in the canary
  if (!details.companyNumber) {
    return null;
  }

  const rows = await db
    .select()
    .from(schema.externalData)
    .where(eq(schema.externalData.crn, details.companyNumber))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    name: row.name,
    crn: row.crn,
    address: row.address,
    postcode: row.postcode,
    lat: row.lat?.toString() ?? null,
    lng: row.lng?.toString() ?? null,
    companyStatus: row.companyStatus,
  };
}
