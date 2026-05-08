import type { DemoRole } from '../lib/sampleData.js';

interface RoleCardProps {
  role: DemoRole;
}

export function RoleCard({ role }: RoleCardProps) {
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
          <dt>Location</dt>
          <dd>{role.location}</dd>
        </div>
        <div>
          <dt>Work mode</dt>
          <dd>{role.workMode}</dd>
        </div>
      </dl>
    </article>
  );
}
