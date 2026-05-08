import { describe, expect, it } from 'vitest';
import {
  buildCanonicalLocationOptions,
  buildLocationGraphModel,
  canonicalLocationKey,
  filterJobsByCanonicalLocation,
  generateLocationGraphCypher,
  jobAdFixtures,
  normalizeLocation,
} from '../src/lib/location/index.js';

describe('normalizeLocation', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeLocation('  Seattle, WA  ')).toBe('Seattle, WA');
  });

  it('collapses repeated internal whitespace', () => {
    expect(normalizeLocation('San   Francisco, CA')).toBe('San Francisco, CA');
  });

  it('normalizes comma spacing', () => {
    expect(normalizeLocation('New York , NY')).toBe('New York, NY');
  });

  it('normalizes state names to abbreviations in the region slot', () => {
    expect(normalizeLocation('San Francisco, California')).toBe('San Francisco, CA');
    expect(normalizeLocation('Seattle, Washington')).toBe('Seattle, WA');
  });

  it('preserves wrappers while normalizing inner location text', () => {
    expect(normalizeLocation('Hybrid (New York, New York, US)')).toBe('Hybrid (New York, NY, US)');
  });
});

describe('canonical location behavior', () => {
  it('generates stable canonical keys from normalized labels', () => {
    expect(canonicalLocationKey('New York , NY')).toBe('new-york-ny');
    expect(canonicalLocationKey('Hybrid (New York, New York, US)')).toBe('hybrid-new-york-ny-us');
  });

  it('deduplicates location options by canonical key', () => {
    const options = buildCanonicalLocationOptions(jobAdFixtures);
    expect(options.find((option) => option.key === 'new-york-ny')).toMatchObject({
      label: 'New York, NY',
      jobCount: 4,
      rawValues: ['New York, NY', 'New York , NY'],
    });
    expect(options.map((option) => option.label)).toEqual([
      'New York, NY',
      'Hybrid (New York, NY, US)',
      'San Francisco, CA',
      'Seattle, WA',
    ]);
  });

  it('matches and filters jobs by canonical key', () => {
    const jobs = filterJobsByCanonicalLocation(jobAdFixtures, canonicalLocationKey('New York, NY'));
    expect(jobs).toHaveLength(4);
    expect(jobs.map((job) => job.rawLocation)).toContain('New York , NY');
  });
});

describe('location graph model', () => {
  it('builds raw and canonical graph nodes from fixtures', () => {
    const graph = buildLocationGraphModel(jobAdFixtures);
    const aberrant = graph.rawLocationNodes.find((node) => node.properties.value === 'New York , NY');
    const canonical = graph.canonicalLocationNodes.find((node) => node.properties.key === 'new-york-ny');

    expect(aberrant).toMatchObject({
      kind: 'RawLocation',
      properties: { value: 'New York , NY', jobCount: 1 },
    });
    expect(canonical).toMatchObject({
      kind: 'CanonicalLocation',
      properties: { label: 'New York, NY', jobCount: 4 },
    });
    expect(graph.relationships).toContainEqual({
      from: 'raw:New York , NY',
      to: 'canonical:new-york-ny',
      type: 'NORMALIZES_TO',
    });
  });

  it('generates deterministic Cypher with expected raw and canonical nodes', () => {
    const cypher = generateLocationGraphCypher(jobAdFixtures);
    expect(cypher).toContain("CREATE (raw_New_York___NY:RawLocation {jobCount: 1, value: 'New York , NY'});");
    expect(cypher).toContain("CREATE (canonical_new_york_ny:CanonicalLocation {jobCount: 4, key: 'new-york-ny', label: 'New York, NY'});");
    expect(cypher).toContain('CREATE (raw_New_York___NY)-[:NORMALIZES_TO]->(canonical_new_york_ny);');
  });
});
