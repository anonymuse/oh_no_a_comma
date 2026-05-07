/**
 * mockAtsPayload.ts
 *
 * Synthetic fixtures that reproduce the observed location string variants.
 *
 * These are not scraped from the live site. They are constructed from manual
 * observation of the public careers UI (screenshots, May 2025) and represent
 * the minimum set of variants needed to demonstrate the normalization failure
 * class and verify the fix.
 *
 * Two fixture shapes are provided:
 *   - Raw label strings (as might appear in a preformatted API response field)
 *   - Structured AtsLocationRecord objects (as might appear if the ATS stores
 *     city, region, country separately and composes the label at render time)
 */

import type { AtsLocationRecord } from './locationTypes.js';

// ─── Raw label strings ────────────────────────────────────────────────────────

/**
 * Location strings that reproduce the observed dropdown variants.
 * Includes both the "buggy" and "canonical-looking" forms for each city.
 */
export const RAW_OBSERVED_LABELS: string[] = [
  // New York office — two variants observed in the wild
  'New York , NY',               // space before comma (the visible bug)
  'New York, NY',                // canonical form

  // New York hybrid — two variants observed in the wild
  'Hybrid (New York, New York, US)',  // full state name
  'Hybrid (New York, NY, US)',        // abbreviated

  // Seattle hybrid — two variants observed in the wild
  'Hybrid (Seattle, Washington, US)', // full state name
  'Hybrid (Seattle, WA, US)',         // abbreviated

  // Seattle office — single canonical form (no observed duplicate)
  'Seattle, WA',

  // San Francisco — single canonical forms
  'San Francisco, CA',
  'Hybrid (San Francisco, CA, US)',

  // Additional US locations without observed duplicates
  'Chicago, IL',
  'Austin, TX',
  'Hybrid (Austin, TX, US)',

  // Non-US locations — should pass through normalization unchanged
  'Dublin, Ireland',
  'London, UK',
  'Bangalore, India',
  'Remote (United States)',
];

/**
 * Expected canonical labels after normalization.
 * The 16 raw strings above should collapse to 13 unique canonical entries
 * (office New York variants deduplicate; New York and Seattle hybrid variants
 * deduplicate).
 */
export const EXPECTED_CANONICAL_LABELS: string[] = [
  'Austin, TX',
  'Chicago, IL',
  'Hybrid (Austin, TX, US)',
  'Hybrid (New York, NY, US)',
  'Hybrid (San Francisco, CA, US)',
  'Hybrid (Seattle, WA, US)',
  'New York, NY',
  'San Francisco, CA',
  'Seattle, WA',
  'Bangalore, India',
  'Dublin, Ireland',
  'London, UK',
  'Remote (United States)',
];

// ─── Structured records ───────────────────────────────────────────────────────

/**
 * Structured AtsLocationRecord fixtures that model the alternative hypothesis:
 * the ATS stores structured fields and composes labels at render time.
 *
 * The region field intentionally varies between full name and abbreviation
 * to reproduce the same class of inconsistency from a different origin point.
 */
export const STRUCTURED_LOCATION_FIXTURES: AtsLocationRecord[] = [
  {
    id: 'loc_001',
    workplaceType: 'office',
    city: 'New York ',  // trailing space — hypothetical data entry artifact
    region: 'NY',
    country: 'US',
  },
  {
    id: 'loc_002',
    workplaceType: 'office',
    city: 'New York',
    region: 'NY',
    country: 'US',
  },
  {
    id: 'loc_003',
    workplaceType: 'hybrid',
    city: 'New York',
    region: 'New York',  // full state name — the second variant class
    country: 'US',
  },
  {
    id: 'loc_004',
    workplaceType: 'hybrid',
    city: 'New York',
    region: 'NY',        // abbreviated — canonical
    country: 'US',
  },
  {
    id: 'loc_005',
    workplaceType: 'hybrid',
    city: 'Seattle',
    region: 'Washington', // full state name
    country: 'US',
  },
  {
    id: 'loc_006',
    workplaceType: 'hybrid',
    city: 'Seattle',
    region: 'WA',         // abbreviated
    country: 'US',
  },
  {
    id: 'loc_007',
    workplaceType: 'office',
    city: 'San Francisco',
    region: 'CA',
    country: 'US',
  },
  {
    id: 'loc_008',
    workplaceType: 'remote',
    country: 'US',
  },
  {
    id: 'loc_009',
    workplaceType: 'office',
    city: 'Dublin',
    country: 'Ireland',   // non-US: should be unaffected by region normalization
  },
];

// ─── Mock job records ─────────────────────────────────────────────────────────

/** Minimal job shape for testing filterByLocation(). */
export interface MockJob {
  id: string;
  title: string;
  location: string;
}

export const MOCK_JOBS: MockJob[] = [
  { id: 'job_001', title: 'Director of Engineering – Platform', location: 'New York , NY' },
  { id: 'job_002', title: 'Senior Platform Engineer', location: 'New York, NY' },
  { id: 'job_003', title: 'Staff Engineer', location: 'Hybrid (New York, New York, US)' },
  { id: 'job_004', title: 'Engineering Manager', location: 'Hybrid (New York, NY, US)' },
  { id: 'job_005', title: 'Site Reliability Engineer', location: 'San Francisco, CA' },
  { id: 'job_006', title: 'Product Manager', location: 'Hybrid (Seattle, Washington, US)' },

  { id: 'job_007', title: 'Data Engineer', location: 'Hybrid (Seattle, WA, US)' },
];
