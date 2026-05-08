const STATE_ABBREVIATIONS: Record<string, string> = {
  'new york': 'NY',
  california: 'CA',
  washington: 'WA',
};

const WRAPPED_LOCATION_PATTERN = /^(?<prefix>[^()]+)\((?<inner>.*)\)$/;

function normalizeWhitespaceAndCommas(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+,\s*/g, ', ')
    .replace(/,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
}

function normalizeStateToken(value: string): string {
  const trimmed = value.trim();
  return STATE_ABBREVIATIONS[trimmed.toLowerCase()] ?? trimmed;
}

function normalizeCommaDelimitedLocation(value: string): string {
  const normalized = normalizeWhitespaceAndCommas(value);
  const parts = normalized.split(',').map((part) => part.trim());

  if (parts.length < 2) {
    return normalized;
  }

  const [locality, region, ...rest] = parts;
  return [locality, normalizeStateToken(region), ...rest].join(', ');
}

export function normalizeLocation(value: string): string {
  const normalized = normalizeWhitespaceAndCommas(value);
  const wrapped = WRAPPED_LOCATION_PATTERN.exec(normalized);

  if (!wrapped?.groups) {
    return normalizeCommaDelimitedLocation(normalized);
  }

  const prefix = normalizeWhitespaceAndCommas(wrapped.groups.prefix).replace(/\s*$/, ' ');
  const inner = normalizeCommaDelimitedLocation(wrapped.groups.inner);
  return `${prefix}(${inner})`;
}
