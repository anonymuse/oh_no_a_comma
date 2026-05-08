import { jobAdFixtures } from '../lib/location/index.js';
import { SceneFrame } from './SceneFrame.js';

function statusFor(rawLocation: string): string {
  if (rawLocation === 'New York , NY') return 'One-off comma-spacing aberration';
  if (/New York|California|Washington/.test(rawLocation.split(',')[1] ?? '')) return 'Full state name in region slot';
  return 'Canonical-looking raw input';
}

export function AdminInputScene() {
  return (
    <SceneFrame
      eyebrow="Scene 02"
      title="Fallible ATS-style input is modeled"
      summary="The fixture is intentionally synthetic and shows plausible customer-configured or human-entered variants without naming any real system."
    >
      <div className="admin-table-card">
        <div className="table-toolbar">
          <strong>Mock job-ad fixture</strong>
          <span>Synthetic only</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Raw location input</th>
              <th>Demo signal</th>
            </tr>
          </thead>
          <tbody>
            {jobAdFixtures.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td><code>{job.rawLocation}</code></td>
                <td>{statusFor(job.rawLocation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SceneFrame>
  );
}
