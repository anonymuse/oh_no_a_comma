import { SceneFrame } from './SceneFrame.js';

const codeSnippet = `const label = normalizeLocation(rawLocation);
const key = canonicalLocationKey(rawLocation);

// Display stays readable; identity becomes stable.
optionsByKey.set(key, {
  key,
  label,
  rawValues: [...rawValues, rawLocation],
  jobCount: jobCount + 1,
});

// Filtering uses the same canonical key.
jobs.filter((job) => canonicalLocationKey(job.rawLocation) === selectedKey);`;

export function CodeDiffScene() {
  return (
    <SceneFrame
      eyebrow="Scene 05"
      title="The deterministic boundary fix"
      summary="Normalize for display, canonicalize for identity, deduplicate by key, and keep raw values for audit/debugging rather than discarding evidence."
    >
      <div className="code-card">
        <div className="code-header">
          <span>src/lib/location/*</span>
          <span className="pill">runtime deterministic</span>
        </div>
        <pre><code>{codeSnippet}</code></pre>
        <div className="highlight-grid">
          <span>Trim/collapse whitespace</span>
          <span>Normalize comma spacing</span>
          <span>Abbreviate region states</span>
          <span>Match by canonical key</span>
        </div>
      </div>
    </SceneFrame>
  );
}
