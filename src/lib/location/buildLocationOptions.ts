import { canonicalLocationKey } from './canonicalLocationKey.js';
import { normalizeLocation } from './normalizeLocation.js';
import type { JobAdFixture, LocationOption, RawLocationOption } from './types.js';

export function buildRawLocationOptions(jobs: readonly JobAdFixture[]): RawLocationOption[] {
  const counts = new Map<string, number>();

  for (const job of jobs) {
    counts.set(job.rawLocation, (counts.get(job.rawLocation) ?? 0) + 1);
  }

  return [...counts.entries()].map(([value, jobCount]) => ({ value, jobCount }));
}

export function buildCanonicalLocationOptions(jobs: readonly JobAdFixture[]): LocationOption[] {
  const options = new Map<string, LocationOption>();

  for (const job of jobs) {
    const key = canonicalLocationKey(job.rawLocation);
    const label = normalizeLocation(job.rawLocation);
    const existing = options.get(key);

    if (existing) {
      existing.jobCount += 1;
      if (!existing.rawValues.includes(job.rawLocation)) {
        existing.rawValues.push(job.rawLocation);
      }
    } else {
      options.set(key, {
        key,
        label,
        rawValues: [job.rawLocation],
        jobCount: 1,
      });
    }
  }

  return [...options.values()];
}

export function filterJobsByCanonicalLocation(
  jobs: readonly JobAdFixture[],
  selectedCanonicalKey: string,
): JobAdFixture[] {
  return jobs.filter((job) => canonicalLocationKey(job.rawLocation) === selectedCanonicalKey);
}
