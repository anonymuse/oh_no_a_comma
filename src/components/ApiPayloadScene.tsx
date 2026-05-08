import { mockAtsPayload } from '../lib/location/index.js';
import { SceneFrame } from './SceneFrame.js';

export function ApiPayloadScene() {
  return (
    <SceneFrame
      eyebrow="Scene 03"
      title="The raw payload crosses the boundary"
      summary="The mocked API preserves raw input for auditability. Public UI code should not blindly render those strings as filter identity."
    >
      <pre className="json-panel" data-testid="api-payload">
        <code>{JSON.stringify(mockAtsPayload, null, 2)}</code>
      </pre>
    </SceneFrame>
  );
}
