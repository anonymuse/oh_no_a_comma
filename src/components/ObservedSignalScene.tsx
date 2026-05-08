import { SceneFrame } from './SceneFrame.js';

export function ObservedSignalScene() {
  return (
    <SceneFrame
      eyebrow="Scene 01"
      title="A tiny public signal is noticed"
      summary="A platform-minded reviewer spots two choices that should be one: `New York , NY` beside `New York, NY`. The comma is not the real issue; trusting fallible raw data at the UI boundary is."
    >
      <div className="signal-card">
        <p className="browser-label">Mock careers filter</p>
        <div className="signal-options" data-testid="signal-panel">
          <span>New York , NY</span>
          <span>New York, NY</span>
          <span>San Francisco, CA</span>
        </div>
        <div className="signal-note">
          <strong>Reviewer note</strong>
          <p>Small aberrations are often boundary-contract clues: pasted, migrated, configured, or integrated strings can reach public frontend controls unless code canonicalizes them first.</p>
        </div>
      </div>
    </SceneFrame>
  );
}
