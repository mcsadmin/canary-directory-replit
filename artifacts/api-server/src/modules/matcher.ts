/**
 * Matching Module (ADR-013)
 *
 * Interface: findCandidates(details, db) -> Promise<Candidate[]>
 * Returns scored candidates from the internal directory.
 * Checks do_not_match rules before returning candidates.
 *
 * Canary implementation: Levenshtein distance-based scoring.
 * Score = (1 - distance/maxLen) * 100
 * Thresholds: HIGH >= 80, MEDIUM >= 15, LOW < 15
 */

import levenshtein from "fast-levenshtein";
import { and, eq, or, ne } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@workspace/db/schema";

export type ConfidenceTier = "high" | "medium" | "low";

export interface DebtorDetails {
  name: string;
  normalisedName: string;
  companyNumber?: string | null;
}

export interface Candidate {
  nodeId: string;
  canonicalName: string;
  score: number;
  tier: ConfidenceTier;
}

const UPPER_THRESHOLD = Number(process.env["MATCH_UPPER_THRESHOLD"] ?? 80);
const LOWER_THRESHOLD = Number(process.env["MATCH_LOWER_THRESHOLD"] ?? 15);

/**
 * Scores a normalised name against an existing normalised name.
 * Returns a score from 0-100.
 */
function scoreNames(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 100;
  const dist = levenshtein.get(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  return Math.round((1 - dist / maxLen) * 100);
}

function getTier(score: number): ConfidenceTier {
  if (score >= UPPER_THRESHOLD) return "high";
  if (score >= LOWER_THRESHOLD) return "medium";
  return "low";
}

/**
 * Finds candidates from the internal directory for a given debtor.
 * Excludes nodes that have a do_not_match rule with the source invoice's new node.
 * @param details - Debtor details including normalised name
 * @param db - Database connection
 * @param excludeNodeId - Exclude a specific node from candidates (e.g., new node being created)
 * @returns Array of scored candidates, highest score first
 */
export async function findCandidates(
  details: DebtorDetails,
  db: NodePgDatabase<typeof schema>,
  excludeNodeId?: string,
): Promise<Candidate[]> {
  // Fetch all non-archived nodes
  const nodes = await db
    .select({
      nodeId: schema.businessNodes.nodeId,
      canonicalName: schema.businessNodes.canonicalName,
    })
    .from(schema.businessNodes)
    .where(
      and(
        eq(schema.businessNodes.isArchived, false),
        excludeNodeId ? ne(schema.businessNodes.nodeId, excludeNodeId) : undefined,
      ),
    );

  // Load all do_not_match rules for filtering
  const doNotMatchRules = await db
    .select({
      nodeIdA: schema.matchRules.nodeIdA,
      nodeIdB: schema.matchRules.nodeIdB,
    })
    .from(schema.matchRules)
    .where(eq(schema.matchRules.ruleType, "do_not_match"));

  const doNotMatchSet = new Set<string>();
  for (const rule of doNotMatchRules) {
    doNotMatchSet.add(`${rule.nodeIdA}:${rule.nodeIdB}`);
    doNotMatchSet.add(`${rule.nodeIdB}:${rule.nodeIdA}`);
  }

  const { normalise } = await import("./nameNormaliser.js");

  const candidates: Candidate[] = [];

  for (const node of nodes) {
    // Skip if do_not_match rule exists with the node being checked
    if (excludeNodeId && (
      doNotMatchSet.has(`${excludeNodeId}:${node.nodeId}`) ||
      doNotMatchSet.has(`${node.nodeId}:${excludeNodeId}`)
    )) {
      continue;
    }

    const normalisedCanonical = normalise(node.canonicalName);
    const score = scoreNames(details.normalisedName, normalisedCanonical);

    if (score > 0) {
      candidates.push({
        nodeId: node.nodeId,
        canonicalName: node.canonicalName,
        score,
        tier: getTier(score),
      });
    }
  }

  // Sort by score descending, return top candidates
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

/**
 * Takes the best candidate and checks do_not_match rules against a specific source node.
 * Used after node creation to filter candidates.
 */
export async function getBestCandidate(
  candidates: Candidate[],
  newNodeId: string,
  db: NodePgDatabase<typeof schema>,
): Promise<Candidate | null> {
  if (candidates.length === 0) return null;

  const doNotMatchRules = await db
    .select()
    .from(schema.matchRules)
    .where(
      and(
        eq(schema.matchRules.ruleType, "do_not_match"),
        or(
          eq(schema.matchRules.nodeIdA, newNodeId),
          eq(schema.matchRules.nodeIdB, newNodeId),
        ),
      ),
    );

  const excludedIds = new Set<string>();
  for (const rule of doNotMatchRules) {
    excludedIds.add(rule.nodeIdA);
    excludedIds.add(rule.nodeIdB);
  }

  for (const candidate of candidates) {
    if (!excludedIds.has(candidate.nodeId) && candidate.nodeId !== newNodeId) {
      return candidate;
    }
  }

  return null;
}

export { UPPER_THRESHOLD, LOWER_THRESHOLD };
