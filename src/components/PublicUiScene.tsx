import { demoRoles } from '../lib/sampleData.js';
import { LocationDropdown } from './LocationDropdown.js';
import { RoleCard } from './RoleCard.js';
import { SceneFrame } from './SceneFrame.js';

interface PublicUiSceneProps {
  mode: 'before' | 'after';
  locationOptions: readonly string[];
}

export function PublicUiScene({ mode, locationOptions }: PublicUiSceneProps) {
  const isAfter = mode === 'after';

  return (
    <SceneFrame
      eyebrow={isAfter ? 'Scene 05' : 'Scene 03'}
      title={isAfter ? 'After fix: public UI renders canonical options' : 'Before fix: public UI renders duplicates'}
      summary={isAfter
        ? 'The same reusable public UI now receives normalized, deduplicated labels.'
        : 'Rendering the raw payload directly exposes duplicate and inconsistent location labels.'}
    >
      <div className="careers-page" data-testid={isAfter ? 'public-ui-after' : 'public-ui-before'}>
        <header className="careers-header">
          <div className="brand-mark" aria-hidden="true">DC</div>
          <div>
            <p className="brand-name">Demo Careers</p>
            <h3>Open roles</h3>
            <p className="demo-notice">Demo notice: this page uses anonymized sample data for UI testing.</p>
          </div>
        </header>
        <div className="careers-layout">
          <aside>
            <LocationDropdown label="Location" options={locationOptions} />
          </aside>
          <main className="role-list">
            {demoRoles.map((role) => <RoleCard key={role.id} role={role} />)}
          </main>
        </div>
      </div>
    </SceneFrame>
  );
}
