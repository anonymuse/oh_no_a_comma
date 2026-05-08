import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLocationGraphCypher, jobAdFixtures } from '../src/lib/location/index.js';

const artifactPath = fileURLToPath(new URL('../demo-artifacts/neo4j-location-graph.cypher', import.meta.url));
mkdirSync(dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, generateLocationGraphCypher(jobAdFixtures));
console.log(`Wrote ${artifactPath}`);
