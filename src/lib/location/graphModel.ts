import { buildCanonicalLocationOptions, buildRawLocationOptions } from './buildLocationOptions.js';
import { canonicalLocationKey } from './canonicalLocationKey.js';
import { normalizeLocation } from './normalizeLocation.js';
import type { GraphNode, JobAdFixture, LocationGraphModel } from './types.js';

function nodeId(kind: string, value: string): string {
  return `${kind}:${value}`;
}

export function buildLocationGraphModel(jobs: readonly JobAdFixture[]): LocationGraphModel {
  const rawOptions = buildRawLocationOptions(jobs);
  const canonicalOptions = buildCanonicalLocationOptions(jobs);

  const jobNodes: GraphNode[] = jobs.map((job) => ({
    id: nodeId('job', job.id),
    kind: 'JobAd',
    label: job.title,
    properties: {
      id: job.id,
      title: job.title,
      team: job.team,
    },
  }));

  const rawLocationNodes: GraphNode[] = rawOptions.map((option) => ({
    id: nodeId('raw', option.value),
    kind: 'RawLocation',
    label: option.value,
    properties: {
      value: option.value,
      jobCount: option.jobCount,
    },
  }));

  const canonicalLocationNodes: GraphNode[] = canonicalOptions.map((option) => ({
    id: nodeId('canonical', option.key),
    kind: 'CanonicalLocation',
    label: option.label,
    properties: {
      key: option.key,
      label: option.label,
      jobCount: option.jobCount,
    },
  }));

  const relationships: LocationGraphModel['relationships'] = jobs.flatMap((job) => {
    const rawId = nodeId('raw', job.rawLocation);
    const canonicalId = nodeId('canonical', canonicalLocationKey(job.rawLocation));
    return [
      { from: nodeId('job', job.id), to: rawId, type: 'HAS_RAW_LOCATION' as const },
      { from: nodeId('job', job.id), to: canonicalId, type: 'HAS_CANONICAL_LOCATION' as const },
    ];
  });

  for (const raw of rawOptions) {
    relationships.push({
      from: nodeId('raw', raw.value),
      to: nodeId('canonical', canonicalLocationKey(raw.value)),
      type: 'NORMALIZES_TO',
    });
  }

  const aberrantRawLocation = rawLocationNodes.find((node) => node.properties.value === 'New York , NY');
  if (!aberrantRawLocation) {
    throw new Error('Expected synthetic aberration "New York , NY" to exist in graph fixtures.');
  }

  return {
    nodes: [...jobNodes, ...rawLocationNodes, ...canonicalLocationNodes],
    relationships,
    rawLocationNodes,
    canonicalLocationNodes,
    aberrantRawLocation,
  };
}

function cypherString(value: string | number): string | number {
  if (typeof value === 'number') return value;
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function cypherProperties(properties: GraphNode['properties']): string {
  return Object.entries(properties)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${cypherString(value)}`)
    .join(', ');
}

function variableName(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

export function generateLocationGraphCypher(jobs: readonly JobAdFixture[]): string {
  const graph = buildLocationGraphModel(jobs);
  const lines = [
    '// Synthetic locality-normalization graph generated from src/lib/location/fixtures.ts',
    'MATCH (n) DETACH DELETE n;',
    '',
  ];

  for (const node of graph.nodes) {
    lines.push(`CREATE (${variableName(node.id)}:${node.kind} {${cypherProperties(node.properties)}});`);
  }

  lines.push('');

  for (const relationship of graph.relationships) {
    lines.push(`CREATE (${variableName(relationship.from)})-[:${relationship.type}]->(${variableName(relationship.to)});`);
  }

  lines.push('', '// Example query: MATCH p=(:RawLocation)-[:NORMALIZES_TO]->(:CanonicalLocation) RETURN p;');
  return `${lines.join('\n')}\n`;
}

export { normalizeLocation };
