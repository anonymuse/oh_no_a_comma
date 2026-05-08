import { SceneFrame } from './SceneFrame.js';

const codeSnippet = `export function normalizeLocation(value: string): string {
  return value
    .trim()                  // trim leading/trailing whitespace
    .replace(/\\s+/g, ' ')    // collapse repeated whitespace
    .replace(/\\s+,\\s*/g, ', '); // normalize comma spacing
}

export function normalizeLocationOptions(raw: string[]): string[] {
  const seen = new Set<string>();
  return raw
    .map(normalizeLocation)  // also abbreviates NY, CA, WA in region position
    .filter((label) => {
      if (seen.has(label)) return false;
      seen.add(label);      // dedupe while preserving first-seen order
      return true;
    });
}`;

export function CodeDiffScene() {
  return (
    <SceneFrame
      eyebrow="Scene 04"
      title="Code change: normalize before rendering"
      summary="The frontend keeps rendering simple, but sends display controls stable labels instead of raw freeform strings."
    >
      <div className="code-card">
        <div className="code-header">
          <span>src/lib/normalizeLocationOptions.ts</span>
          <span className="pill">deterministic</span>
        </div>
        <pre><code>{codeSnippet}</code></pre>
        <div className="highlight-grid">
          <span>Trim</span>
          <span>Comma cleanup</span>
          <span>State abbreviation</span>
          <span>Deduplication</span>
        </div>
      </div>
    </SceneFrame>
  );
}
