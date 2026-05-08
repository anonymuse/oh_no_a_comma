import { LocationDropdown } from './LocationDropdown.js';

interface LocationFilterProps {
  options: readonly string[];
}

export function LocationFilter({ options }: LocationFilterProps) {
  return <LocationDropdown label="Location" options={options} />;
}
