import type { JobAdFixture, MockAtsPayload } from './types.js';

export const jobAdFixtures: JobAdFixture[] = [
  {
    id: 'job-001',
    title: 'Platform Reliability Lead',
    team: 'Platform Enablement',
    rawLocation: 'New York, NY',
    workMode: 'Hybrid',
    description: 'Synthetic role used to show the larger canonical New York cluster.',
  },
  {
    id: 'job-002',
    title: 'Internal Developer Experience Manager',
    team: 'Platform Enablement',
    rawLocation: 'New York, NY',
    workMode: 'Hybrid',
    description: 'Synthetic role used to show canonical matching after normalization.',
  },
  {
    id: 'job-003',
    title: 'Release Systems Principal',
    team: 'Delivery Infrastructure',
    rawLocation: 'New York, NY',
    workMode: 'Hybrid',
    description: 'Synthetic role that belongs in the same canonical New York result set.',
  },
  {
    id: 'job-004',
    title: 'Workflow Configuration Analyst',
    team: 'Operations Tooling',
    rawLocation: 'New York , NY',
    workMode: 'Hybrid',
    description: 'The deliberate one-off aberration: an extra space before the comma.',
  },
  {
    id: 'job-005',
    title: 'Frontend Platform Engineer',
    team: 'Candidate Experience',
    rawLocation: 'Hybrid (New York, New York, US)',
    workMode: 'Hybrid',
    description: 'Synthetic hybrid wrapper with a full state name in the region slot.',
  },
  {
    id: 'job-006',
    title: 'Design Systems Engineer',
    team: 'Candidate Experience',
    rawLocation: 'Hybrid (New York, NY, US)',
    workMode: 'Hybrid',
    description: 'Synthetic hybrid wrapper already using a state abbreviation.',
  },
  {
    id: 'job-007',
    title: 'Data Quality Engineer',
    team: 'Insights Platform',
    rawLocation: 'San Francisco, California',
    workMode: 'Onsite',
    description: 'Synthetic full-state-name locality for deterministic normalization tests.',
  },
  {
    id: 'job-008',
    title: 'Integration Test Engineer',
    team: 'Insights Platform',
    rawLocation: 'San Francisco, CA',
    workMode: 'Onsite',
    description: 'Synthetic canonical-looking San Francisco locality.',
  },
  {
    id: 'job-009',
    title: 'Customer Configuration Specialist',
    team: 'Implementation Platform',
    rawLocation: 'Seattle, Washington',
    workMode: 'Remote-friendly',
    description: 'Synthetic full-state-name Seattle locality.',
  },
  {
    id: 'job-010',
    title: 'Enterprise Migration Engineer',
    team: 'Implementation Platform',
    rawLocation: 'Seattle, WA',
    workMode: 'Remote-friendly',
    description: 'Synthetic canonical-looking Seattle locality.',
  },
];

export const rawLocations = jobAdFixtures.map((job) => job.rawLocation);

export const mockAtsPayload: MockAtsPayload = {
  source: 'synthetic-ats-fixture',
  generatedFor: 'locality-normalization-demo',
  jobs: jobAdFixtures,
  locations: rawLocations,
};
