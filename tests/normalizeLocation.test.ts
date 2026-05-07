/**
 * normalizeLocation.test.ts
 *
 * Unit tests for the deterministic normalization utility.
 *
 * Test ordering is intentional: the first tests in each suite correspond
 * directly to the observed behavior on the public careers page. This makes
 * the connection between the real symptom and the regression test explicit —
 * a reviewer can see that each case was grounded in observation, not invented.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeLocation,
  normalizePunctuation,
  normalizeRegion,
  composeLabelFromRecord,
} from '../src/normalizeLocation.js';

// ─── Observed bugs — these are the cases that triggered the investigation ─────

describe('observed variants from rippling.com/careers', () => {
  it('normalizes "New York , NY" to "New York, NY" (space before comma)', () => {
    expect(normalizeLocation('New York , NY')).toBe('New York, NY');
  });

  it('normalizes "Hybrid (New York, New York, US)" to abbreviated state form', () => {
    expect(normalizeLocation('Hybrid (New York, New York, US)')).toBe(
      'Hybrid (New York, NY, US)',
    );
  });

  it('treats both New York hybrid variants as equal after normalization', () => {
    expect(normalizeLocation('Hybrid (New York, New York, US)')).toBe(
      normalizeLocation('Hybrid (New York, NY, US)'),
    );
  });

  it('treats both New York office variants as equal after normalization', () => {
    expect(normalizeLocation('New York , NY')).toBe(
      normalizeLocation('New York, NY'),
    );
  });

  it('normalizes "Hybrid (Seattle, Washington, US)" to abbreviated state form', () => {
    expect(normalizeLocation('Hybrid (Seattle, Washington, US)')).toBe(
      'Hybrid (Seattle, WA, US)',
    );
  });

  it('treats both Seattle hybrid variants as equal after normalization', () => {
    expect(normalizeLocation('Hybrid (Seattle, Washington, US)')).toBe(
      normalizeLocation('Hybrid (Seattle, WA, US)'),
    );
  });
});

// ─── normalizePunctuation ─────────────────────────────────────────────────────

describe('normalizePunctuation', () => {
  it('removes space before comma', () => {
    expect(normalizePunctuation('New York , NY')).toBe('New York, NY');
  });

  it('handles multiple spaces before comma', () => {
    expect(normalizePunctuation('New York   , NY')).toBe('New York, NY');
  });

  it('does not alter already-correct strings', () => {
    expect(normalizePunctuation('New York, NY')).toBe('New York, NY');
  });

  it('removes space after open paren', () => {
    expect(normalizePunctuation('Hybrid ( New York, NY, US)')).toBe(
      'Hybrid (New York, NY, US)',
    );
  });

  it('removes space before close paren', () => {
    expect(normalizePunctuation('Hybrid (New York, NY, US )')).toBe(
      'Hybrid (New York, NY, US)',
    );
  });

  it('collapses multiple internal spaces', () => {
    expect(normalizePunctuation('San  Francisco,  CA')).toBe('San Francisco, CA');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizePunctuation('  Seattle, WA  ')).toBe('Seattle, WA');
  });
});

// ─── normalizeRegion ──────────────────────────────────────────────────────────

describe('normalizeRegion', () => {
  it('converts "New York" to "NY"', () => {
    expect(normalizeRegion('New York')).toBe('NY');
  });

  it('converts "Washington" to "WA"', () => {
    expect(normalizeRegion('Washington')).toBe('WA');
  });

  it('converts "California" to "CA"', () => {
    expect(normalizeRegion('California')).toBe('CA');
  });

  it('passes through an already-abbreviated state', () => {
    expect(normalizeRegion('NY')).toBe('NY');
  });

  it('handles case-insensitive input', () => {
    expect(normalizeRegion('new york')).toBe('NY');
  });

  it('passes through non-US region unchanged', () => {
    expect(normalizeRegion('Ireland')).toBe('Ireland');
  });

  it('handles multi-word states: New Hampshire', () => {
    expect(normalizeRegion('New Hampshire')).toBe('NH');
  });

  it('handles multi-word states: West Virginia', () => {
    expect(normalizeRegion('West Virginia')).toBe('WV');
  });
});

// ─── Work type prefix ─────────────────────────────────────────────────────────

describe('normalizeLocation — work type prefix', () => {
  it('title-cases lowercase hybrid prefix', () => {
    expect(normalizeLocation('hybrid (Seattle, WA, US)')).toBe(
      'Hybrid (Seattle, WA, US)',
    );
  });

  it('title-cases lowercase remote prefix', () => {
    expect(normalizeLocation('remote (United States)')).toBe(
      'Remote (United States)',
    );
  });

  it('normalizes on-site variants', () => {
    expect(normalizeLocation('in-office (New York, NY)')).toBe(
      'On-site (New York, NY)',
    );
  });

  it('does not alter a correctly-cased prefix', () => {
    expect(normalizeLocation('Hybrid (Seattle, WA, US)')).toBe(
      'Hybrid (Seattle, WA, US)',
    );
  });
});

// ─── Non-US locations ─────────────────────────────────────────────────────────

describe('normalizeLocation — non-US pass-through', () => {
  it('does not mutate "Dublin, Ireland"', () => {
    expect(normalizeLocation('Dublin, Ireland')).toBe('Dublin, Ireland');
  });

  it('does not mutate "London, UK"', () => {
    expect(normalizeLocation('London, UK')).toBe('London, UK');
  });

  it('does not mutate "Bangalore, India"', () => {
    expect(normalizeLocation('Bangalore, India')).toBe('Bangalore, India');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('normalizeLocation — edge cases', () => {
  it('returns null for null input', () => {
    expect(normalizeLocation(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect(normalizeLocation(undefined)).toBeUndefined();
  });

  it('returns empty string for empty string input', () => {
    expect(normalizeLocation('')).toBe('');
  });

  it('handles a heavily malformed string without throwing', () => {
    expect(() =>
      normalizeLocation('  hybrid  ( new york  ,  new york ,  us )  '),
    ).not.toThrow();
  });

  it('normalizes a heavily malformed hybrid string', () => {
    expect(normalizeLocation('  hybrid  ( new york  ,  new york ,  us )  ')).toBe(
      'Hybrid (New York, NY, US)',
    );
  });
});

// ─── composeLabelFromRecord ───────────────────────────────────────────────────

describe('composeLabelFromRecord', () => {
  it('composes a canonical office label from clean fields', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'office', city: 'New York', region: 'NY', country: 'US' }),
    ).toBe('New York, NY');
  });

  it('normalizes trailing whitespace in city field', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'office', city: 'New York ', region: 'NY', country: 'US' }),
    ).toBe('New York, NY');
  });

  it('normalizes full region name to abbreviation', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'hybrid', city: 'New York', region: 'New York', country: 'US' }),
    ).toBe('Hybrid (New York, NY, US)');
  });

  it('uses rawLabel when present, running it through normalization', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'hybrid', rawLabel: 'Hybrid (New York , New York, US)' }),
    ).toBe('Hybrid (New York, NY, US)');
  });

  it('composes a remote label with country', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'remote', country: 'US' }),
    ).toBe('Remote (US)');
  });

  it('composes a bare remote label without country', () => {
    expect(
      composeLabelFromRecord({ workplaceType: 'remote' }),
    ).toBe('Remote');
  });
});
