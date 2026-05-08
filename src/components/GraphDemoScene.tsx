import { buildLocationGraphModel, jobAdFixtures } from '../lib/location/index.js';
import { SceneFrame } from './SceneFrame.js';

const graph = buildLocationGraphModel(jobAdFixtures);
const rawNewYorkNodes = graph.rawLocationNodes.filter((node) => String(node.properties.value).includes('New York'));
const canonicalNewYork = graph.canonicalLocationNodes.find((node) => node.properties.key === 'new-york-ny');

export function GraphDemoScene() {
  return (
    <SceneFrame
      eyebrow="Scene 07"
      title="Graph view makes aberrations obvious"
      summary="The Neo4j-style model shows one small raw `New York , NY` node converging into the same canonical `New York, NY` cluster as the larger raw node."
    >
      <div className="graph-panel" data-testid="graph-panel">
        <div className="graph-canvas" aria-label="Neo4j-style before and after location graph">
          <svg viewBox="0 0 720 360" role="img" aria-labelledby="graph-title graph-desc">
            <title id="graph-title">Synthetic location graph</title>
            <desc id="graph-desc">Raw New York location nodes normalize to one canonical New York node.</desc>
            <line x1="140" y1="120" x2="360" y2="180" />
            <line x1="140" y1="250" x2="360" y2="180" />
            <line x1="360" y1="180" x2="590" y2="180" />
            <circle className="node raw large" cx="140" cy="120" r="52" />
            <circle className="node raw small" cx="140" cy="250" r="28" />
            <circle className="node canonical" cx="360" cy="180" r="62" />
            <circle className="node jobs" cx="590" cy="180" r="45" />
            <text x="140" y="116" textAnchor="middle">New York, NY</text>
            <text x="140" y="138" textAnchor="middle">3 jobs</text>
            <text x="140" y="247" textAnchor="middle">New York , NY</text>
            <text x="140" y="269" textAnchor="middle">1 job</text>
            <text x="360" y="176" textAnchor="middle">New York, NY</text>
            <text x="360" y="198" textAnchor="middle">canonical 4</text>
            <text x="590" y="176" textAnchor="middle">matched jobs</text>
            <text x="590" y="198" textAnchor="middle">4 results</text>
          </svg>
        </div>
        <div className="graph-facts">
          <h3>Graph facts</h3>
          <ul>
            {rawNewYorkNodes.map((node) => (
              <li key={node.id} data-testid={node.properties.value === 'New York , NY' ? 'aberrant-raw-node' : undefined}><code>{String(node.properties.value)}</code> raw node: {String(node.properties.jobCount)} job(s)</li>
            ))}
            <li data-testid="canonical-new-york-node"><code>{String(canonicalNewYork?.properties.label)}</code> canonical node: {String(canonicalNewYork?.properties.jobCount)} job(s)</li>
          </ul>
        </div>
      </div>
    </SceneFrame>
  );
}
