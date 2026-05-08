# Oh no, a comma: locality normalization case study

This repository is a small, anonymized Vite + React + TypeScript case study about a public ATS-style careers UI inconsistency. A platform-engineering-focused reviewer notices that equivalent locality labels can render as separate filter options, for example `New York , NY` beside `New York, NY`.

The issue is not the comma itself. The issue is that human-entered or customer-configured ATS-style data can be fallible, inconsistent, migrated, pasted, integrated, or otherwise unanticipated. Public UI code should not require humans to be perfect before rendering correctly.

Everything in this repository is synthetic. It contains no real company names, ATS vendors, domains, email addresses, logos, screenshots, scraped data, or real job listings.

## What the demo shows

The walkthrough in `src/components/GuidedWalkthrough.tsx` tells an eight-scene story:

1. notice the subtle public UI signal;
2. model likely fallible ATS-style input with synthetic job ads;
3. inspect the raw API/payload boundary;
4. show before-fix public locality rendering with duplicate or near-duplicate options;
5. implement deterministic normalization, canonical keys, deduplication, and matching;
6. show after-fix public locality rendering and canonical-key filtering;
7. render a lightweight Neo4j-style graph that makes one-off raw aberrations visible;
8. explain deterministic regression tests and optional AI-assisted review guidance.

## Synthetic fixture examples

The fixture intentionally includes raw values such as:

```text
New York , NY
New York, NY
Hybrid (New York, New York, US)
Hybrid (New York, NY, US)
San Francisco, California
San Francisco, CA
Seattle, Washington
Seattle, WA
```

The raw `New York , NY` value is associated with one synthetic job ad, while `New York, NY` has several. The after-fix UI normalizes both to the same canonical `New York, NY` option and filtering by that canonical key returns all matching New York jobs.

## Deterministic location domain module

The single source of truth lives under `src/lib/location/`:

```text
src/lib/location/types.ts                 Shared fixture, option, and graph types
src/lib/location/fixtures.ts              Synthetic job ads and mocked ATS payload
src/lib/location/normalizeLocation.ts     Display-label normalization
src/lib/location/canonicalLocationKey.ts  Stable keys for dedupe and matching
src/lib/location/buildLocationOptions.ts  Raw/canonical options and filtering
src/lib/location/graphModel.ts            Neo4j-style graph data and Cypher generation
```

The normalizer trims leading/trailing whitespace, collapses repeated whitespace, normalizes comma spacing, converts supported state names in the region slot to abbreviations, and preserves wrappers such as `Hybrid (...)` while normalizing the inner locality.

## Neo4j-style graph demo

No Neo4j instance is required for tests or runtime. The React demo uses a lightweight SVG/HTML graph panel, and the deterministic generator writes a Cypher file for optional manual exploration:

```bash
npm run graph:cypher
```

The generated artifact is `demo-artifacts/neo4j-location-graph.cypher`. See `docs/neo4j-demo.md` for Neo4j Browser and `cypher-shell` instructions.

## AI usage policy

Generative AI is documented as assistive only: edge-case brainstorming, test-design review, diff review, and post-deployment anomaly review. It is not required at runtime, in tests, in CI, or for deterministic validation. See `docs/ai-usage.md`.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Required checks

```bash
npm run typecheck
npm run test
npm run validate
npm run build
npm run graph:cypher
npm run e2e
npm run demo:screenshots
```

`npm run validate` runs deterministic validation only. Browser commands require Playwright browsers to be installed in the execution environment.

## Project structure

```text
src/lib/location/     Framework-agnostic location domain utilities and fixtures
src/components/       Reusable React walkthrough scenes and UI components
scripts/              Deterministic artifact generators
docs/                 AI and Neo4j demo notes
tests/                Vitest and Playwright regression coverage
demo-artifacts/       Generated screenshots and Cypher output
```
