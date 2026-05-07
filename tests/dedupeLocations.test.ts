/**
 * dedupeLocations.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  deduplicateLocations,
  filterByLocation,
  buildAuditReport,
  findDuplicateCanonicalLabels,
} from '../src/dedupeLocations.js';
import { MOCK_JOBS, RAW_OBSERVED_LABELS } from '../src/mockAtsPayload.js';

describe('deduplicateLocations', () => {
  it('collapses both New York office variants into one entry', () => {
    const result = deduplicateLocations(['New York , NY', 'New York, NY']);
    expect(result).toEqual(['New York, NY']);
  });

  it('collapses both New York hybrid variants into one entry', () => {
    const result = deduplicateLocations([
      'Hybrid (New York, New York, US)',
      'Hybrid (New York, NY, US)',
    ]);
    expect(result).toEqual(['Hybrid (New York, NY, US)']);
  });

  it('collapses both Seattle hybrid variants into one entry', () => {
    const result = deduplicateLocations([
      'Hybrid (Seattle, Washington, US)',
      'Hybrid (Seattle, WA, US)',
    ]);
    expect(result).toEqual(['Hybrid (Seattle, WA, US)']);
  });

  it('reduces the full observed label set to fewer canonical entries', () => {
    const result = deduplicateLocations(RAW_OBSERVED_LABELS);
    expect(result.length).toBeLessThan(RAW_OBSERVED_LABELS.length);
  });

  it('sorts plain city entries before hybrid/remote entries', () => {
    const result = deduplicateLocations([
      'Hybrid (Seattle, WA, US)',
      'New York, NY',
      'Remote (United States)',
      'San Francisco, CA',
    ]);
    expect(result[0]).toBe('New York, NY');
    expect(result[1]).toBe('San Francisco, CA');
  });

  it('handles an empty array', () => {
    expect(deduplicateLocations([])).toEqual([]);
  });

  it('handles a single-item array', () => {
    expect(deduplicateLocations(['New York , NY'])).toEqual(['New York, NY']);
  });

  it('filters out falsy values', () => {
    expect(deduplicateLocations(['', 'New York, NY', ''])).toEqual(['New York, NY']);
  });
});

describe('filterByLocation', () => {
  it('returns jobs matching the canonical NY form regardless of raw string variant', () => {
    const result = filterByLocation(MOCK_JOBS, 'New York, NY');
    expect(result.map((j) => j.id)).toEqual(['job_001', 'job_002']);
  });

  it('returns jobs matching canonical hybrid NY form regardless of variant', () => {
    const result = filterByLocation(MOCK_JOBS, 'Hybrid (New York, NY, US)');
    expect(result.map((j) => j.id)).toEqual(['job_003', 'job_004']);
  });

  it('returns jobs matching canonical hybrid Seattle form regardless of variant', () => {
    const result = filterByLocation(MOCK_JOBS, 'Hybrid (Seattle, WA, US)');
    expect(result.map((j) => j.id)).toEqual(['job_006', 'job_007']);
  });

  it('returns all jobs when selected is null', () => {
    expect(filterByLocation(MOCK_JOBS, null)).toHaveLength(MOCK_JOBS.length);
  });

  it('returns all jobs when selected is empty string', () => {
    expect(filterByLocation(MOCK_JOBS, '')).toHaveLength(MOCK_JOBS.length);
  });

  it('returns empty array when no jobs match the selected location', () => {
    expect(filterByLocation(MOCK_JOBS, 'Austin, TX')).toEqual([]);
  });
});

describe('buildAuditReport', () => {
  it('reports changed and unchanged counts correctly', () => {
    const report = buildAuditReport([
      'New York , NY',
      'New York, NY',
      'San Francisco, CA',
    ]);
    expect(report.totalRaw).toBe(3);
    expect(report.totalCanonical).toBe(2);
    expect(report.deduplicationSavings).toBe(1);
    expect(report.changed).toHaveLength(1);
    expect(report.changed[0]).toEqual({ raw: 'New York , NY', canonical: 'New York, NY' });
    expect(report.unchanged).toContain('San Francisco, CA');
  });
});

describe('findDuplicateCanonicalLabels', () => {
  it('identifies labels that normalize to the same canonical form', () => {
    const dupes = findDuplicateCanonicalLabels([
      'New York , NY',
      'New York, NY',
      'San Francisco, CA',
    ]);
    expect(dupes).toContain('New York, NY');
    expect(dupes).not.toContain('San Francisco, CA');
  });

  it('returns empty array when no duplicates exist', () => {
    expect(
      findDuplicateCanonicalLabels(['New York, NY', 'San Francisco, CA']),
    ).toEqual([]);
  });
});
