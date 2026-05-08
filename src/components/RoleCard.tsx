import { normalizeLocation, type JobAdFixture } from '../lib/location/index.js';

interface RoleCardProps {
  role: JobAdFixture;
  mode: 'before' | 'after';
}

export function RoleCard({ role, mode }: RoleCardProps) {
  return (
    <article className="role-card">
      <div>
        <h4>{role.title}</h4>
        <p>{role.description}</p>
      </div>
      <dl>
        <div>
          <dt>Team</dt>
          <dd>{role.team}</dd>
        </div>
        <div>
          <dt>{mode === 'after' ? 'Canonical location' : 'Raw location'}</dt>
          <dd>{mode === 'after' ? normalizeLocation(role.rawLocation) : role.rawLocation}</dd>
        </div>
        <div>
          <dt>Work mode</dt>
          <dd>{role.workMode}</dd>
        </div>
      </dl>
    </article>
  );
}
