import { SceneFrame } from './SceneFrame.js';

const checks = [
  'Unit: trims leading and trailing whitespace',
  'Unit: cleans comma spacing',
  'Unit: abbreviates supported full state names',
  'Unit: deduplicates normalized display labels',
  'Unit: preserves first-seen order',
  'Browser: before scene shows duplicate raw labels',
  'Browser: after scene contains no duplicate visible labels',
  'Browser: after scene shows New York, San Francisco, and Seattle canonical labels',
];

export function TestResultsScene() {
  return (
    <SceneFrame
      eyebrow="Scene 06"
      title="Regression tests"
      summary="Deterministic unit tests cover the normalizer, and browser tests verify the walkthrough states a reviewer sees."
    >
      <div className="test-results" data-testid="test-results-panel">
        <div className="terminal-bar">
          <span />
          <span />
          <span />
          <strong>demo regression suite</strong>
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
