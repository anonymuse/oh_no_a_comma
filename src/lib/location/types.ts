export interface JobAdFixture {
  id: string;
  title: string;
  team: string;
  rawLocation: string;
  workMode: string;
  description: string;
}

export interface LocationOption {
  key: string;
  label: string;
  rawValues: string[];
  jobCount: number;
}

export interface RawLocationOption {
  value: string;
  jobCount: number;
}

export interface MockAtsPayload {
  source: 'synthetic-ats-fixture';
  generatedFor: 'locality-normalization-demo';
  jobs: JobAdFixture[];
  locations: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  kind: 'JobAd' | 'RawLocation' | 'CanonicalLocation';
  properties: Record<string, string | number>;
}

export interface GraphRelationship {
  from: string;
  to: string;
  type: 'HAS_RAW_LOCATION' | 'NORMALIZES_TO' | 'HAS_CANONICAL_LOCATION';
}

export interface LocationGraphModel {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  rawLocationNodes: GraphNode[];
  canonicalLocationNodes: GraphNode[];
  aberrantRawLocation: GraphNode;
}
