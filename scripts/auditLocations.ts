/**
 * auditLocations.ts
 *
 * Fetches public job listing data and reports normalization delta.
 *
 * Run: npm run audit
 *
 * Attempts to fetch the public Rippling jobs endpoint. If unavailable or
 * auth-gated, falls back to the synthetic fixture set so the script always
 * produces useful output.
 *
 * Output:
 *   - Total raw location strings
 *   - Total canonical strings after normalization
 *   - Deduplication savings
 *   - Diff of changed strings (raw → canonical)
 *   - Unchanged strings count
 *
 * This script is informational only. It does not modify any data. It does
 * not authenticate, scrape, or exceed normal browser request behavior.
 */

import { buildAuditReport } from '../src/dedupeLocations.js';
import { RAW_OBSERVED_LABELS } from '../src/mockAtsPayload.js';

const PUBLIC_JOBS_URL =
  'https://ats.rippling.com/api/recruiting/jobs?companyId=rippling';

const FETCH_TIMEOUT_MS = 8000;

// ─── Fetch attempt ────────────────────────────────────────────────────────────

async function fetchPublicJobLocations(): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(PUBLIC_JOBS_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // The response shape is inferred from public observation.
    // Adapt if the actual shape differs.
    const jobs = Array.isArray(data) ? data : data?.jobs ?? data?.data ?? [];
    const locations: string[] = jobs
      .map((j: Record<string, unknown>) => j.location ?? j.location_label ?? j.workplace_location)
      .filter((l: unknown): l is string => typeof l === 'string' && l.length > 0);

    return locations;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[audit] Could not fetch public jobs data (${message}). Using synthetic fixtures.`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Report rendering ─────────────────────────────────────────────────────────

function renderReport(locations: string[], source: 'live' | 'fixture'): void {
  const report = buildAuditReport(locations);
  const sourceLabel = source === 'live' ? 'live public API' : 'synthetic fixtures';

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ATS Location Normalization Audit');
  console.log(`  Source: ${sourceLabel}`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`  Total raw strings:       ${report.totalRaw}`);
  console.log(`  Total canonical strings: ${report.totalCanonical}`);
  console.log(`  Deduplication savings:   ${report.deduplicationSavings}`);
  console.log(
    `  Change rate:             ${((report.changed.length / report.totalRaw) * 100).toFixed(1)}%`,
  );

  if (report.changed.length === 0) {
    console.log('\n  ✓ No normalization changes needed. All strings are already canonical.');
  } else {
    console.log(`\n  Strings that would be changed (${report.changed.length}):\n`);
    report.changed.forEach(({ raw, canonical }) => {
      console.log(`    BEFORE  "${raw}"`);
      console.log(`    AFTER   "${canonical}"\n`);
    });
  }

  if (report.deduplicationSavings > 0) {
    console.log(
      `  ⚠  ${report.deduplicationSavings} duplicate(s) would be removed from the filter dropdown.`,
    );
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('[audit] Attempting to fetch public job listings...');
  const liveLocations = await fetchPublicJobLocations();

  if (liveLocations.length > 0) {
    renderReport(liveLocations, 'live');
  } else {
    console.log('[audit] Falling back to synthetic fixture data.');
    renderReport(RAW_OBSERVED_LABELS, 'fixture');
  }
}

main().catch((err) => {
  console.error('[audit] Fatal error:', err);
  process.exit(1);
});
