import { SceneFrame } from './SceneFrame.js';

const checks = [
  'Unit: trim, whitespace collapse, comma spacing, and state abbreviation',
  'Unit: wrapper preservation for Hybrid (...) labels',
  'Unit: canonical key generation and deduplication',
  'Unit: filtering by canonical key prevents fragmented results',
  'Unit: graph model and generated Cypher are deterministic',
  'Browser: before scene shows raw duplicate locality options',
  'Browser: after scene shows canonical deduplicated options',
  'Browser: graph panel shows aberrant raw node converging to canonical node',
  'AI: optional assist for edge-case brainstorming and diff review only',
];

export function TestResultsScene() {
  return (
    <SceneFrame
      eyebrow="Scene 08"
      title="Regression tests stay the source of truth"
      summary="Generative AI can help brainstorm edge cases and review anomalies, but deterministic TypeScript, Vitest, Playwright, and generated artifacts gate the demo."
    >
      <div className="test-results" data-testid="test-results-panel">
        <div className="terminal-bar">
          <span />
          <span />
          <span />
          <strong>deterministic validation suite</strong>
        </div>
        <ul>
          {checks.map((check) => (
            <li key={check}>
              <span className="checkmark">✓</span>
              {check}
            </li>
          ))}
        </ul>
      </div>
    </SceneFrame>
  );
}
