# Demo Careers location normalization walkthrough

This repository is a small forensic, educational frontend demo about a visible public UI inconsistency: equivalent job locations can render differently when backend-entered location strings are formatted differently. The mocked careers page intentionally starts with labels such as `New York , NY`, `New York, NY`, `Hybrid (New York, New York, US)`, and `Hybrid (New York, NY, US)` to show how a minor data-quality issue can become a noticeable public filter defect.

The story is more important than the stack. The app walks through the issue as an investigation: raw location data enters a backend-like source, an API returns those raw strings, the public UI renders duplicate or inconsistent options, a deterministic frontend normalization layer is added, and automated checks protect the corrected behavior.

Use this repo to demonstrate troubleshooting mindset, attention to UI detail, release validation, and frontend normalization of inconsistent source data. It is intentionally anonymized and uses mock data only; it is not intended to identify, reproduce, or criticize any specific company or employer.

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

## Guided Demo

Run the demo when you want to narrate the issue from symptom to fix:

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

Suggested walkthrough script:

1. Start on **Source data** and point out that the rows are semantically equivalent but formatted inconsistently.
2. Move to **API payload** and note that the frontend receives raw strings rather than canonical display labels.
3. Pause on **Before UI** and inspect the location dropdown: duplicated options and spacing/state-name variants are visible to users.
4. Continue to **Code change** and explain that the fix is intentionally small, deterministic, and frontend-focused.
5. Review **After UI** and confirm the public dropdown now shows one stable label per location variant.
6. End on **Tests** to connect the fix to release validation: unit coverage checks normalization rules, while browser checks verify the rendered UI.

Interpret the demo as a data-quality and validation lesson, not as a backend blame exercise. The frontend cannot fix every upstream data issue, but it can make equivalent display values consistent, remove duplicate filter options, and add automated checks that catch regressions before release.

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
