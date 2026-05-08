import { mockApiPayload } from '../lib/sampleData.js';
import { SceneFrame } from './SceneFrame.js';

export function ApiPayloadScene() {
  return (
    <SceneFrame
      eyebrow="Scene 02"
      title="API returns raw location values"
      summary="The demo payload intentionally returns raw labels, so the frontend must decide whether to render or normalize them."
    >
      <pre className="json-panel" data-testid="api-payload">
        <code>{JSON.stringify(mockApiPayload, null, 2)}</code>
      </pre>
    </SceneFrame>
  );
}
