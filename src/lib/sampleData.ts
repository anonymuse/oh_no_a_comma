export const rawLocations = [
  'Hybrid (New York, New York, US)',
  'Hybrid (New York, NY, US)',
  'New York , NY',
  'New York, NY',
  'Hybrid (San Francisco, California, US)',
  'Hybrid (San Francisco, CA, US)',
  'Hybrid (Seattle, Washington, US)',
  'Hybrid (Seattle, WA, US)',
  'San Francisco, CA',
  'Seattle, WA',
] as const;

export interface DemoRole {
  id: string;
  title: string;
  team: string;
  location: string;
  workMode: string;
  description: string;
}

export const demoRoles: DemoRole[] = [
  {
    id: 'role-001',
    title: 'Role 001',
    team: 'Team A',
    location: 'New York, NY',
    workMode: 'Hybrid',
    description: 'Placeholder description for a synthetic role used in UI testing.',
  },
  {
    id: 'role-002',
    title: 'Role 002',
    team: 'Team B',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    description: 'Placeholder description for a synthetic role used in UI testing.',
  },
  {
    id: 'role-003',
    title: 'Role 003',
    team: 'Team C',
    location: 'Seattle, WA',
    workMode: 'Remote-friendly',
    description: 'Placeholder description for a synthetic role used in UI testing.',
  },
];

export const mockApiPayload = {
  source: 'synthetic-demo-fixture',
  locations: rawLocations,
  roles: demoRoles,
};
