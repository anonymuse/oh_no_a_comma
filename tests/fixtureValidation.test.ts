/**
 * fixtureValidation.test.ts
 *
 * CI fixture validation. This test suite runs against the mock payload and
 * asserts that after normalization, no duplicate canonical labels exist.
 *
 * Purpose: this is the regression guard. If a new fixture is added that
 * reintroduces a duplicate, this test fails and blocks the build before
 * the bug reaches a reviewer.
 *
 * Philosophy: do not wait for a candidate or customer to notice presentation
 * drift that deterministic checks can catch cheaply at CI time.
 */

import { describe, it, expect } from 'vitest';
import { findDuplicateCanonicalLabels, deduplicateLocations } from '../src/dedupeLocations.js';
import { RAW_OBSERVED_LABELS, EXPECTED_CANONICAL_LABELS } from '../src/mockAtsPayload.js';

describe('fixture validation — no duplicate canonical labels', () => {
  it('produces zero duplicate canonical labels from the observed fixture set', () => {
    const duplicates = findDuplicateCanonicalLabels(RAW_OBSERVED_LABELS);
    expect(duplicates).toEqual([]);
  });

  it('reduces the observed label count through normalization', () => {
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    expect(canonical.length).toBeLessThan(RAW_OBSERVED_LABELS.length);
  });

  it('produces the expected canonical label set from the observed fixtures', () => {
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    const sorted = [...canonical].sort();
    const expectedSorted = [...EXPECTED_CANONICAL_LABELS].sort();
    expect(sorted).toEqual(expectedSorted);
  });

  it('every canonical label in the output is unique', () => {
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    const unique = new Set(canonical);
    expect(canonical.length).toBe(unique.size);
  });
});

describe('fixture validation — canonical label format', () => {
  it('no canonical label has a space before a comma', () => {
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    canonical.forEach((label) => {
      expect(label).not.toMatch(/\s,/);
    });
  });

  it('no canonical label has a full US state name', () => {
    const fullStateNames = ['New York', 'Washington', 'California', 'Texas'];
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    // A full state name at the end of a label (after a comma) indicates
    // normalization did not run. "New York" as a city name is fine.
    canonical.forEach((label) => {
      fullStateNames.forEach((name) => {
        // Match ", New York" or "(New York, New York" — state in region position
        expect(label).not.toMatch(new RegExp(`,\\s*${name}[,)]`));
      });
    });
  });

  it('hybrid labels follow the "Hybrid (City, ST, Country)" format', () => {
    const canonical = deduplicateLocations(RAW_OBSERVED_LABELS);
    const hybridLabels = canonical.filter((l) => l.startsWith('Hybrid'));
    hybridLabels.forEach((label) => {
      expect(label).toMatch(/^Hybrid \([^)]+\)$/);
    });
  });
});
