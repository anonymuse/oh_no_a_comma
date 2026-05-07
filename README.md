# ATS Location Canonicalization — Case Study

A portfolio case study on identifying, reproducing, and preventing a class of
data-normalization defect visible in a public careers experience.

This project is based on a limited public observation: a careers UI appears to
render semantically equivalent location values with slightly different
formatting — `New York , NY` and `New York, NY`, and similar variants for
hybrid roles. The goal is not to assert a confirmed production root cause. The
goal is to show how a platform engineering team could investigate the signal,
reproduce the failure class, apply a defensive fix, and prevent recurrence
through validation and release controls.

> **Disclosure**: This project is not affiliated with Rippling or any ATS
> provider. It does not inspect private systems, bypass authentication, or make
> claims about non-public backend implementation. All observations are from
> public browser inspection. All test data is synthetic.

---

## Positioning for reviewers

This is not a claim that a particular company has a meaningful production
defect. It is a demonstration of engineering posture:

- notice small inconsistencies that most people scroll past;
- infer likely system boundaries without overclaiming from incomplete evidence;
- turn ambiguous observations into testable synthetic fixtures;
- fix the failure *class*, not just the visible string;
- use automation to prevent recurrence at the release boundary;
- apply GenAI as an assistive review layer, not a source of truth.

That is the core platform-engineering lesson. The comma is the prompt, not the
point.

---

## Executive summary

A public careers page can expose subtle data-contract issues when location
labels are generated from inconsistent source data. The visible symptom here is
small formatting drift in location filter options: extra whitespace before a
comma, different state representations, and duplicate-looking hybrid labels.

The proposed engineering response treats this as a canonicalization-boundary
problem:

1. Observe the visible inconsistency using public page data and screenshots.
2. Reconstruct plausible ATS payload variants that could produce the rendering
   difference.
3. Model both likely data shapes: preformatted strings and structured fields.
4. Write failing regression tests that demonstrate duplicate or non-canonical
   labels.
5. Add deterministic normalization for location display labels.
6. Deduplicate filter options by canonical key, not raw display string.
7. Add CI validation so future fixture or payload changes surface before
   release.
8. Use GenAI as an assistive anomaly detector in non-blocking review mode.

---

## Observed symptom

On the public careers page, the location filter dropdown contains entries
that appear to represent the same city under multiple spellings:

```
New York , NY                        ← space before comma
New York, NY                         ← standard format
Hybrid (New York, New York, US)      ← full state name
Hybrid (New York, NY, US)            ← abbreviated state
Hybrid (Seattle, Washington, US)     ← full state name
Hybrid (Seattle, WA, US)             ← abbreviated state
```

A candidate selecting `New York , NY` likely sees a different result set than
one selecting `New York, NY`. Whether they do depends on whether the filter
logic also normalizes before matching — but no evidence from public inspection
suggests it does.

---

## Forensic hypothesis

The visible behavior can be explained by one or more ordinary data-flow issues.
None of these hypotheses requires a severe backend defect. The most plausible
class of issue is weak canonicalization at a data boundary.

| Hypothesis | Explanation | How to test with DevTools |
|---|---|---|
| Raw display strings from ATS records | Frontend receives already-formatted location labels and renders directly | Inspect network payloads for `location`, `location_label`, `display_name`, `workplace_location` |
| Labels composed from structured fields | Frontend builds labels from `city`, `state`, `country`, `workplace_type` but does not trim or canonicalize components first | Compare raw structured fields against rendered dropdown text |
| Mixed state name conventions | Some records use `NY`; others use `New York` | Search payloads for both `NY` and `New York` |
| Deduplication uses raw labels | `New York , NY` and `New York, NY` are treated as distinct strings | Inspect dropdown option arrays or run a console probe against option text |
| Hybrid labels assembled by a separate code path | Hybrid role labels use a different formatter than office-location labels, resulting in different region representation | Compare rendering logic or payload fields for workplace type |

---

## Data model

The repository models both likely forms of ATS location data: a preformatted
string label and a structured record with discrete fields.

```ts
export type WorkplaceType = 'office' | 'hybrid' | 'remote';

export interface AtsLocationRecord {
  id: string;
  workplaceType: WorkplaceType;
  city?: string;
  region?: string;
  country?: string;
  rawLabel?: string;
}
```

Modeling both shapes matters because the correct normalization strategy differs:
a structured record should be normalized field-by-field before label
composition; a preformatted string needs a defensive rendering pass. A
production fix likely needs both layers.

---

## Fix summary

**Deterministic normalization** — three passes applied in order:

1. Punctuation spacing: remove whitespace before commas, normalize spacing
   inside parentheses, collapse double spaces.
2. Region canonicalization: normalize full US state names to 2-letter postal
   abbreviations.
3. Prefix casing: title-case `Hybrid`, `Remote`, `On-site` prefixes.

**Deduplication by canonical key** — build the filter option list from
normalized strings, not raw ones.

**Filter matching by canonical key** — match selected filter values against
normalized job location strings so all variants of a city resolve to the same
result set.

Example behavior:

```ts
normalizeLocation('New York , NY');
// → 'New York, NY'

normalizeLocation('Hybrid (New York, New York, US)');
// → 'Hybrid (New York, NY, US)'

normalizeLocation('hybrid ( seattle , washington , us )');
// → 'Hybrid (Seattle, WA, US)'
```

---

## GenAI role

GenAI is used in this project as an **assistive review layer**, not a source of
truth. See [`docs/ai-usage.md`](./docs/ai-usage.md) for the full rationale.

The `scripts/detectNearDuplicateLabels.ts` script uses Claude to group
semantically similar location strings and flag candidates for human review. It
runs in CI as a **non-blocking** step — it annotates the output but does not
gate the build. Deterministic checks gate the build.

---

## Running the project

```bash
npm install
npm test                    # Vitest unit tests with coverage
npm run validate            # Fixture validation — fails on duplicate canonical labels
npm run audit               # Fetch public job data and report normalization deltas
npm run detect-dupes        # AI-assisted near-duplicate label detector (non-blocking)
npm run typecheck           # tsc --noEmit
```

---

## Repository structure

```
ats-location-canonicalization/
  README.md
  POSTMORTEM.md
  CLAUDE.md
  package.json
  tsconfig.json
  vitest.config.ts
  .gitignore
  src/
    locationTypes.ts           Interface definitions and WorkplaceType enum
    normalizeLocation.ts       Deterministic normalization utility (3 passes)
    dedupeLocations.ts         Deduplication and filter-matching logic
    mockAtsPayload.ts          Synthetic fixtures reproducing observed variants
    components/
      LocationFilter.tsx       React component + useLocationFilter hook
  tests/
    normalizeLocation.test.ts  Unit tests — observed bugs as first test cases
    dedupeLocations.test.ts    Dedup and filter tests
    fixtureValidation.test.ts  CI guard: asserts no duplicate canonical labels
  scripts/
    auditLocations.ts          Fetch public job data; report normalization delta
    detectNearDuplicateLabels.ts  AI-assisted near-duplicate detector (non-blocking)
  docs/
    forensic-notes.md          Detailed DevTools investigation playbook
    ai-usage.md                GenAI governance rationale for this project
    postmortem-notes.md        Extended post-mortem working notes
  .github/
    workflows/
      ci.yml                   TypeScript check + tests + fixture validation
```

---

## References

- Public careers page: https://www.rippling.com/careers/open-roles
- Job page under review: https://ats.rippling.com/rippling/jobs/60dc87c6-1f47-428c-bd7c-98c9f7419653
- Screenshots: captured manually from the public careers UI, May 2025
