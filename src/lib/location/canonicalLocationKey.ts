import { normalizeLocation } from './normalizeLocation.js';

export function canonicalLocationKey(value: string): string {
  return normalizeLocation(value)
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
