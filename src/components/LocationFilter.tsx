/**
 * LocationFilter.tsx
 *
 * Drop-in React component and headless hook for a normalized location filter.
 *
 * The key behavioral difference from a naive implementation:
 *
 *   BEFORE (buggy):
 *     const options = [...new Set(jobs.map(j => j.location))];
 *     // "New York , NY" and "New York, NY" appear as two distinct entries.
 *
 *   AFTER (fixed):
 *     const options = deduplicateLocations(jobs.map(j => j.location));
 *     // Both variants collapse to one canonical "New York, NY" entry.
 *     // Selecting it matches jobs filed under either raw string.
 *
 * Note: this component is illustrative rather than a packaged runnable React
 * app. React is expected as a host application's peer dependency; this repo
 * keeps only @types/react in devDependencies for typechecking the example.
 */

import { useMemo, useState, useCallback } from 'react';
import { deduplicateLocations, filterByLocation } from '../dedupeLocations.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationFilterProps {
  /** Full array of job objects. Must have a `location: string` field. */
  jobs: Array<{ location: string; [key: string]: unknown }>;
  /** Callback fired with the filtered jobs array on selection change. */
  onFilter?: (filtered: Array<{ location: string; [key: string]: unknown }>) => void;
  /** Placeholder label for the "show all" option. */
  placeholder?: string;
  /** Additional CSS class applied to the <select> element. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LocationFilter
 *
 * A controlled <select> that builds its option list from normalized,
 * deduplicated job location strings. Selecting a value fires onFilter with
 * the subset of jobs whose normalized location matches the selection.
 */
export function LocationFilter({
  jobs = [],
  onFilter,
  placeholder = 'All Locations',
  className = '',
}: LocationFilterProps) {
  const [selected, setSelected] = useState('');

  const locationOptions = useMemo(
    () => deduplicateLocations(jobs.map((j) => j.location).filter(Boolean)),
    [jobs],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setSelected(value);
      onFilter?.(filterByLocation(jobs as Array<{ location: string }>, value || null) as typeof jobs);
    },
    [jobs, onFilter],
  );

  return (
    <select
      value={selected}
      onChange={handleChange}
      className={`location-filter ${className}`.trim()}
      aria-label="Filter by location"
    >
      <option value="">{placeholder}</option>
      {locationOptions.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}

// ─── Headless hook ────────────────────────────────────────────────────────────

/**
 * useLocationFilter
 *
 * Headless version of LocationFilter for use with custom UI implementations.
 * Manages the canonical option list and filtered jobs state internally.
 *
 * @example
 * const { locationOptions, filteredJobs, setSelected } = useLocationFilter(jobs);
 */
export function useLocationFilter<T extends { location: string }>(jobs: T[] = []) {
  const [selected, setSelected] = useState('');

  const locationOptions = useMemo(
    () => deduplicateLocations(jobs.map((j) => j.location).filter(Boolean)),
    [jobs],
  );

  const filteredJobs = useMemo(
    () => filterByLocation(jobs, selected || null),
    [jobs, selected],
  );

  return { locationOptions, selected, setSelected, filteredJobs };
}

export default LocationFilter;
