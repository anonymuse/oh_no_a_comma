import {
  buildCanonicalLocationOptions,
  buildRawLocationOptions,
  canonicalLocationKey,
  filterJobsByCanonicalLocation,
  jobAdFixtures,
} from '../lib/location/index.js';
import { LocationDropdown } from './LocationDropdown.js';
import { RoleCard } from './RoleCard.js';
import { SceneFrame } from './SceneFrame.js';

interface PublicUiSceneProps {
  mode: 'before' | 'after';
}

export function PublicUiScene({ mode }: PublicUiSceneProps) {
  const isAfter = mode === 'after';
  const rawOptions = buildRawLocationOptions(jobAdFixtures).map((option) => ({ label: option.value, count: option.jobCount }));
  const canonicalOptions = buildCanonicalLocationOptions(jobAdFixtures).map((option) => ({
    label: option.label,
    count: option.jobCount,
    rawValues: option.rawValues,
  }));
  const selectedKey = canonicalLocationKey('New York, NY');
  const visibleJobs = isAfter
    ? filterJobsByCanonicalLocation(jobAdFixtures, selectedKey)
    : jobAdFixtures.filter((job) => job.rawLocation === 'New York, NY');

  return (
    <SceneFrame
      eyebrow={isAfter ? 'Scene 06' : 'Scene 04'}
      title={isAfter ? 'After fix: canonical options and matching' : 'Before fix: raw options fragment the UI'}
      summary={isAfter
        ? 'Options are deduplicated by canonical key, and filtering by `New York, NY` also includes the one-off `New York , NY` job.'
        : 'The dropdown exposes near-duplicates, and selecting the canonical-looking raw string misses the one aberrant job.'}
    >
      <div className="careers-page" data-testid={isAfter ? 'public-ui-after' : 'public-ui-before'}>
        <header className="careers-header">
          <div className="brand-mark" aria-hidden="true">DC</div>
          <div>
            <p className="brand-name">Demo Careers</p>
            <h3>Open roles</h3>
            <p className="demo-notice">Synthetic data only. Selected demo filter: New York, NY.</p>
          </div>
        </header>
        <div className="filter-proof" data-testid={isAfter ? 'after-match-proof' : 'before-match-proof'}>
          {isAfter ? 'Canonical match returns 4 New York jobs from 2 raw labels.' : 'Raw-string match returns 3 New York jobs and leaves 1 stranded option.'}
        </div>
        <div className="careers-layout">
          <aside>
            <LocationDropdown label="Location" options={isAfter ? canonicalOptions : rawOptions} selected="New York, NY" />
          </aside>
          <main className="role-list">
            {visibleJobs.map((role) => <RoleCard key={role.id} role={role} mode={mode} />)}
          </main>
        </div>
      </div>
    </SceneFrame>
  );
}
