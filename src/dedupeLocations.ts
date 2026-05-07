/**
 * dedupeLocations.ts
 *
 * Deduplication and filter-matching logic for ATS location strings.
 *
 * Separation of concerns: normalizeLocation.ts owns string transformation;
 * this module owns collection-level operations that depend on it.
 */

import { normalizeLocation } from './normalizeLocation.js';
import type { NormalizationAuditResult } from './locationTypes.js';

/**
 * Deduplicate an array of raw location strings after normalization.
 *
 * Strings that are semantically equivalent after normalization collapse into
 * a single entry. The canonical form of the first-seen representative is used.
 * Results are sorted with plain city/state entries before hybrid/remote.
 *
 * @example
 * deduplicateLocations(['New York , NY', 'New York, NY', 'San Francisco, CA'])
 * // → ['New York, NY', 'San Francisco, CA']
 */
export function deduplicateLocations(rawLocations: string[]): string[] {
  const seen = new Map<string, string>(); // canonical key → canonical value

  for (const raw of rawLocations) {
    if (!raw) continue;
    const canonical = normalizeLocation(raw) ?? raw;
    if (!seen.has(canonical)) {
      seen.set(canonical, canonical);
    }
  }

  return [...seen.values()].sort((a, b) => {
    const aIsModified = /^(hybrid|remote|on-site)/i.test(a);
    const bIsModified = /^(hybrid|remote|on-site)/i.test(b);
    if (aIsModified !== bIsModified) return aIsModified ? 1 : -1;
    return a.localeCompare(b);
  });
}

/**
 * Filter a collection of job-like objects by a selected canonical location.
 *
 * The key behavior here: each job's raw location string is normalized before
 * comparison, so a filter selection of 'New York, NY' will match jobs whose
 * location is stored as 'New York , NY', 'New York, NY', or any variant that
 * normalizes to the same canonical form.
 *
 * @param jobs         Array of objects with a `location` string field.
 * @param selected     The canonical location string to filter by. Pass null
 *                     or empty string to return all jobs.
 */
export function filterByLocation<T extends { location: string }>(
  jobs: T[],
  selected: string | null | undefined,
): T[] {
  if (!selected) return jobs;
  return jobs.filter(
    (job) => (normalizeLocation(job.location) ?? job.location) === selected,
  );
}

/**
 * Build a deduplication audit report comparing raw strings to their canonical
 * forms. Useful for the audit script and migration planning.
 */
export function buildAuditReport(rawLocations: string[]): NormalizationAuditResult {
  const changed: Array<{ raw: string; canonical: string }> = [];
  const unchanged: string[] = [];
  const canonicalSet = new Set<string>();

  for (const raw of rawLocations) {
    const canonical = normalizeLocation(raw) ?? raw;
    canonicalSet.add(canonical);
    if (canonical !== raw) {
      changed.push({ raw, canonical });
    } else {
      unchanged.push(raw);
    }
  }

  return {
    totalRaw: rawLocations.length,
    totalCanonical: canonicalSet.size,
    deduplicationSavings: rawLocations.length - canonicalSet.size,
    changed,
    unchanged,
  };
}

/**
 * Find canonical strings that appear more than once in a list.
 * Used by the CI fixture validation test to assert no duplicates survive.
 */
export function findDuplicateCanonicalLabels(rawLocations: string[]): string[] {
  const counts = new Map<string, number>();

  for (const raw of rawLocations) {
    const canonical = normalizeLocation(raw) ?? raw;
    counts.set(canonical, (counts.get(canonical) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([label]) => label);
}
