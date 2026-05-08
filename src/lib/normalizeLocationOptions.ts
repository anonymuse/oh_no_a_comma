import { normalizeLocation } from './normalizeLocation.js';

export function normalizeLocationOptions(rawLocations: readonly string[]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const rawLocation of rawLocations) {
    const label = normalizeLocation(rawLocation);
    if (!seen.has(label)) {
      seen.add(label);
      options.push(label);
    }
  }

  return options;
}
