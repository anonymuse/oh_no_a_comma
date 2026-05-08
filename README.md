# Demo Careers location normalization walkthrough

A small Vite + React + TypeScript frontend demo that plays like a short recorded screen-share. It shows a common data-quality UI failure mode: a location filter receives equivalent freeform location strings, renders duplicate options, and then improves after deterministic normalization is applied before display.

## Anonymization note

This repository uses synthetic data only. It includes no real company names, logos, domains, email addresses, screenshots, job listings, scraped content, or identifiable employer data. The generic brand used by the app is **Demo Careers**.

## What the demo demonstrates

The guided walkthrough moves through six scenes:

1. **Source data enters the backend** — a mock admin table contains inconsistent raw location inputs.
2. **API returns raw location values** — a synthetic JSON payload returns those raw strings.
3. **Before fix: public UI renders duplicates** — the location dropdown displays raw duplicate and inconsistent labels.
4. **Code change: normalize before rendering** — a focused snippet highlights the normalizer and option builder.
5. **After fix: public UI renders canonical options** — the same UI component receives normalized, deduplicated labels.
6. **Regression tests** — a test-results panel lists unit and browser checks that protect the behavior.

The walkthrough autoplays by default and includes **Pause**, **Previous**, **Next**, **Restart**, and clickable timeline controls.

## Synthetic sample data

Raw location fixture values:

- `Hybrid (New York, New York, US)`
- `Hybrid (New York, NY, US)`
- `New York , NY`
- `New York, NY`
- `Hybrid (San Francisco, California, US)`
- `Hybrid (San Francisco, CA, US)`
- `Hybrid (Seattle, Washington, US)`
- `Hybrid (Seattle, WA, US)`
- `San Francisco, CA`
- `Seattle, WA`

Sample roles are placeholders: Role 001 on Team A, Role 002 on Team B, and Role 003 on Team C.

## Normalization logic

The framework-agnostic utility in `src/lib/normalizeLocation.ts`:

- Trims leading and trailing whitespace.
- Collapses repeated internal whitespace.
- Normalizes spacing around commas.
- Converts supported full state names in region position to abbreviations: New York → NY, California → CA, Washington → WA.
- Preserves wrappers such as `Hybrid (...)` while normalizing the inner location text.

`src/lib/normalizeLocationOptions.ts` maps raw labels through the normalizer, deduplicates display values, and preserves first-seen order so option order stays stable.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Production build

```bash
npm run build
```

## Tests

```bash
npm run test
npm run typecheck
npm run e2e
```

The Vitest suite covers trimming, comma cleanup, full-state abbreviation, wrapper preservation, deduplication, first-seen order preservation, and the observed duplicate-collapse examples from the synthetic fixture.

The Playwright suite loads the walkthrough, navigates to the before and after scenes, confirms duplicate raw labels are visible before normalization, confirms the after-scene labels are unique, and confirms expected canonical labels are visible.

## Demo artifacts

Generate one screenshot per scene:

```bash
npm run demo:screenshots
```

Screenshots are written to `demo-artifacts/`:

- `01-source-data.png`
- `02-api-payload-before.png`
- `03-public-ui-before.png`
- `04-code-change.png`
- `05-public-ui-after.png`
- `06-regression-tests.png`

Optional video recording uses Playwright's video-enabled project:

```bash
npm run demo:record
```

## Project structure

```text
src/lib/                         Framework-agnostic sample data and normalization utilities
src/components/                  Reusable walkthrough, scene, dropdown, and role-card components
tests/normalizeLocationOptions.test.ts  Unit coverage for normalization behavior
tests/e2e/                       Playwright browser and screenshot tests
demo-artifacts/                  Generated screenshot output directory
```
