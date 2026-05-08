# Neo4j-style locality graph demo

The graph demo is deterministic and based only on synthetic fixtures from `src/lib/location/fixtures.ts`. A live Neo4j instance is optional.

## Generate Cypher

```bash
npm run graph:cypher
```

This writes:

```text
demo-artifacts/neo4j-location-graph.cypher
```

The generated graph uses this shape:

```text
(:JobAd {id, title, team})
(:RawLocation {value, jobCount})
(:CanonicalLocation {key, label, jobCount})
(:JobAd)-[:HAS_RAW_LOCATION]->(:RawLocation)
(:RawLocation)-[:NORMALIZES_TO]->(:CanonicalLocation)
(:JobAd)-[:HAS_CANONICAL_LOCATION]->(:CanonicalLocation)
```

## Run in Neo4j Browser

1. Start a local Neo4j database or open a sandbox you control.
2. Open `demo-artifacts/neo4j-location-graph.cypher`.
3. Paste the file into Neo4j Browser and run it.
4. Explore convergence with:

```cypher
MATCH p=(:RawLocation)-[:NORMALIZES_TO]->(:CanonicalLocation)
RETURN p;
```

## Run with cypher-shell

```bash
cypher-shell -u neo4j -p '<password>' < demo-artifacts/neo4j-location-graph.cypher
```

## What to look for

The small raw node `New York , NY` has one job and normalizes to the canonical `New York, NY` node. The canonical node has a larger count because it also includes the larger raw `New York, NY` cluster.
