/**
 * normalizeLocation.ts
 *
 * Deterministic normalization for ATS location strings.
 *
 * Applies three passes in order:
 *   1. normalizePunctuation   — whitespace around commas, parens, collapses
 *   2. normalizeRegion        — full US state names → 2-letter postal codes
 *   3. normalizeWorkTypePrefix — title-cases Hybrid / Remote / On-site prefix
 *
 * Design principles:
 *   - Deterministic and side-effect-free. Same input always produces same output.
 *   - Null-safe. Passing null or undefined returns the value unchanged.
 *   - Non-US locations pass through without mutation.
 *   - Does not call any external service. GenAI is a separate, non-blocking layer.
 *   - Optimistic: if a string cannot be normalized confidently, return it unchanged.
 */

import type { AtsLocationRecord, CanonicalLocation } from './locationTypes.js';

// ─── Region alias map ────────────────────────────────────────────────────────

/**
 * Full US state names → 2-letter postal abbreviations.
 * Sorted by descending name length so multi-word states (e.g. "New Hampshire")
 * match before shorter overlapping names (e.g. "New").
 */
const REGION_ALIASES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

// ─── Pass 1: punctuation ─────────────────────────────────────────────────────

/**
 * Normalize punctuation and whitespace in a location string.
 *
 * Handles the most commonly observed variant class:
 *   "New York , NY"  →  "New York, NY"
 */
export function normalizePunctuation(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')         // collapse internal whitespace
    .replace(/\s+,/g, ',')        // remove space before comma
    .replace(/,(\S)/g, ', $1')    // ensure single space after comma
    .replace(/\(\s+/g, '(')       // remove space after open paren
    .replace(/\s+\)/g, ')');      // remove space before close paren
}

// ─── Pass 2: region canonicalization ─────────────────────────────────────────

/**
 * Normalize a single region string to its 2-letter postal abbreviation.
 * If the input is already a 2-letter code or is not a known US state name,
 * it is returned trimmed but otherwise unchanged.
 *
 * @example normalizeRegion('New York')  → 'NY'
 * @example normalizeRegion('NY')        → 'NY'
 * @example normalizeRegion('London')    → 'London'
 */
export function normalizeRegion(region: string): string {
  const trimmed = region.trim();
  return REGION_ALIASES[trimmed] ?? REGION_ALIASES[
    Object.keys(REGION_ALIASES).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase(),
    ) ?? ''
  ] ?? trimmed;
}

/**
 * Title-case obviously lowercased city/country components without rewriting
 * already-mixed-case labels. This keeps the normalizer conservative while
 * still making heavily malformed fixture strings readable.
 */
function normalizeLocationComponent(component: string): string {
  const trimmed = component.trim();
  if (!trimmed) return trimmed;
  if (trimmed === trimmed.toLowerCase()) {
    return trimmed.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  }
  return trimmed;
}

function normalizeCountryComponent(component: string): string {
  const normalized = normalizeLocationComponent(component);
  return normalized.length === 2 ? normalized.toUpperCase() : normalized;
}

/**
 * Normalize only comma-delimited region positions, not every occurrence of a
 * state name. This preserves city names such as "New York" while still
 * canonicalizing region values like "New York" or "Washington".
 */
function normalizeRegionPositions(str: string): string {
  const workTypeMatch = /^(?<prefix>[A-Za-z][A-Za-z\s-]*)\((?<inner>.*)\)$/.exec(str);

  if (workTypeMatch?.groups) {
    return `${workTypeMatch.groups.prefix}(${normalizeRegionPositions(workTypeMatch.groups.inner)})`;
  }

  const parts = str.split(',').map((part) => part.trim());
  if (parts.length < 2) return normalizeLocationComponent(str);

  const [city, region, ...rest] = parts;
  const normalizedParts = [
    normalizeLocationComponent(city),
    normalizeRegion(region),
    ...rest.map(normalizeCountryComponent),
  ];

  return normalizedParts.join(', ');
}

// ─── Pass 3: work type prefix ─────────────────────────────────────────────────

/**
 * Ensure the work-type prefix (Hybrid, Remote, On-site) is consistently
 * title-cased regardless of how it was entered.
 */
function normalizeWorkTypePrefix(str: string): string {
  return str
    .replace(/^hybrid\b/i, 'Hybrid')
    .replace(/^remote\b/i, 'Remote')
    .replace(/^on[\s-]?site\b/i, 'On-site')
    .replace(/^in[\s-]?office\b/i, 'On-site');
}

// ─── Master function ──────────────────────────────────────────────────────────

/**
 * Normalize a raw ATS location string into a canonical display label.
 *
 * Applies all three passes in order. If the input is null, undefined, or not
 * a string, it is returned as-is without throwing.
 *
 * @example
 * normalizeLocation('New York , NY')
 * // → 'New York, NY'
 *
 * @example
 * normalizeLocation('Hybrid (New York, New York, US)')
 * // → 'Hybrid (New York, NY, US)'
 *
 * @example
 * normalizeLocation('hybrid ( seattle , washington , us )')
 * // → 'Hybrid (Seattle, WA, US)'
 *
 * @example
 * normalizeLocation('Dublin, Ireland')
 * // → 'Dublin, Ireland'  (non-US: passes through unchanged)
 */
export function normalizeLocation(raw: string | null | undefined): string | null | undefined {
  if (raw == null || typeof raw !== 'string') return raw;
  const step1 = normalizePunctuation(raw);
  const step2 = normalizeRegionPositions(step1);
  const step3 = normalizeWorkTypePrefix(step2);
  return step3;
}

// ─── Structured record normalization ─────────────────────────────────────────

/**
 * Compose a canonical label from a structured AtsLocationRecord.
 *
 * Normalizes each field individually before composition so that trailing
 * whitespace in `city` or full state names in `region` are cleaned before
 * they can contribute to an inconsistent label.
 *
 * This is the preferred path when structured fields are available, because it
 * catches the class of bug where inconsistency originates in field values
 * rather than in a preformatted string.
 */
export function composeLabelFromRecord(record: {
  workplaceType: string;
  city?: string;
  region?: string;
  country?: string;
  rawLabel?: string;
}): string {
  // If a raw label is present, normalize it as a string — it may have been
  // entered with the city/region already composed.
  if (record.rawLabel) {
    return normalizeLocation(record.rawLabel) ?? record.rawLabel;
  }

  const city = record.city?.trim() ?? '';
  const region = record.region ? normalizeRegion(record.region) : '';
  const country = record.country?.trim().toUpperCase() ?? '';

  const locationParts = [city, region, country].filter(Boolean).join(', ');

  switch (record.workplaceType) {
    case 'hybrid':
      return `Hybrid (${locationParts})`;
    case 'remote':
      return country ? `Remote (${locationParts})` : 'Remote';
    default:
      return [city, region].filter(Boolean).join(', ');
  }
}
