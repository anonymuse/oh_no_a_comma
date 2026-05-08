import { rawLocations } from '../lib/sampleData.js';
import { SceneFrame } from './SceneFrame.js';

export function AdminInputScene() {
  return (
    <SceneFrame
      eyebrow="Scene 01"
      title="Source data enters the backend"
      summary="A mock admin table shows how equivalent places can be entered with slightly different strings."
    >
      <div className="admin-table-card">
        <div className="table-toolbar">
          <strong>Mock backend input</strong>
          <span>Synthetic fixture</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Raw location input</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rawLocations.map((location, index) => (
              <tr key={`${location}-${index}`}>
                <td>{String(index + 1).padStart(3, '0')}</td>
                <td><code>{location}</code></td>
                <td>{location.includes(' ,') || /New York|California|Washington/.test(location.split(',')[1] ?? '') ? 'Needs normalization' : 'Canonical-looking'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SceneFrame>
  );
}
