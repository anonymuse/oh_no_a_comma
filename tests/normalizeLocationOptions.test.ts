import { describe, expect, it } from 'vitest';
import { normalizeLocation } from '../src/lib/normalizeLocation.js';
import { normalizeLocationOptions } from '../src/lib/normalizeLocationOptions.js';

const rawLocations = [
  'Hybrid (New York, New York, US)',
  'Hybrid (New York, NY, US)',
  'New York , NY',
  'New York, NY',
  'Hybrid (San Francisco, California, US)',
  'Hybrid (San Francisco, CA, US)',
  'Hybrid (Seattle, Washington, US)',
  'Hybrid (Seattle, WA, US)',
  'San Francisco, CA',
  'Seattle, WA',
];

describe('normalizeLocation', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeLocation('  Seattle, WA  ')).toBe('Seattle, WA');
  });

  it('collapses repeated internal whitespace', () => {
    expect(normalizeLocation('San   Francisco, CA')).toBe('San Francisco, CA');
  });

  it('cleans comma spacing', () => {
    expect(normalizeLocation('New York , NY')).toBe('New York, NY');
  });

  it('abbreviates supported full state names in region position', () => {
    expect(normalizeLocation('Hybrid (San Francisco, California, US)')).toBe('Hybrid (San Francisco, CA, US)');
    expect(normalizeLocation('Hybrid (Seattle, Washington, US)')).toBe('Hybrid (Seattle, WA, US)');
  });

  it('preserves wrappers while normalizing inner location text', () => {
    expect(normalizeLocation('Hybrid (New York, New York, US)')).toBe('Hybrid (New York, NY, US)');
  });
});

describe('normalizeLocationOptions', () => {
  it('deduplicates normalized display values', () => {
    expect(normalizeLocationOptions(['New York , NY', 'New York, NY'])).toEqual(['New York, NY']);
  });

  it('preserves first-seen order', () => {
    expect(normalizeLocationOptions(['Seattle, WA', 'New York , NY', 'Seattle, WA'])).toEqual([
      'Seattle, WA',
      'New York, NY',
    ]);
  });

  it('collapses New York plain variants to one label', () => {
    expect(normalizeLocationOptions(['New York , NY', 'New York, NY'])).toEqual(['New York, NY']);
  });

  it('collapses New York hybrid variants to one label', () => {
    expect(normalizeLocationOptions(['Hybrid (New York, New York, US)', 'Hybrid (New York, NY, US)'])).toEqual([
      'Hybrid (New York, NY, US)',
    ]);
  });

  it('returns stable display-ready labels for the sample payload', () => {
    expect(normalizeLocationOptions(rawLocations)).toEqual([
      'Hybrid (New York, NY, US)',
      'New York, NY',
      'Hybrid (San Francisco, CA, US)',
      'Hybrid (Seattle, WA, US)',
      'San Francisco, CA',
      'Seattle, WA',
    ]);
  });
});
