# Post-Mortem: Location Label Canonicalization Gap

**Severity**: P3 — Low (UX polish issue; no data loss; no security impact)  
**Status**: Proposed remediation — not yet applied  
**Date of Observation**: May 2025  
**Author**: Jesse White (external observation, public page only)  
**System Observed**: `rippling.com/careers` — location filter dropdown  

---

## Disclaimer

This post-mortem is based on public-page observation only. The root cause
hypotheses below are plausible inferences from visible browser behavior — they
are not confirmed diagnoses. No internal systems, authenticated APIs, or
private data were accessed.

---

## Executive summary

The location filter dropdown on a public careers page renders multiple near-
duplicate entries for the same city. A candidate selecting one option may not
see jobs filed under the other. The most plausible hypothesis is that location
strings are stored as freeform text without normalization at write or render
time, and the frontend deduplication step uses exact string equality rather
than a canonical key. A deterministic fix exists and is proposed here.

---

## Observed behavior

| Rendered | Notes |
|---|---|
| `New York , NY` | Space before comma |
| `New York, NY` | Canonical-looking form |
| `Hybrid (New York, New York, US)` | Full state name |
| `Hybrid (New York, NY, US)` | Abbreviated state |
| `Hybrid (Seattle, Washington, US)` | Full state name |
| `Hybrid (Seattle, WA, US)` | Abbreviated state |

---

## Hypothesized failure mode

The following are the most plausible explanations based on public observation.
They are not mutually exclusive.

**Hypothesis A — Freeform string storage**  
The `location` field on ATS job records is a free-text string. Recruiters
enter it manually with no normalization on save. Minor typographic differences
(space before comma, full vs. abbreviated state) persist in the data store and
surface verbatim in the careers page API response.

**Hypothesis B — Composed label with inconsistent structured fields**  
The ATS stores location as structured fields (`city`, `region`, `country`,
`workplaceType`) and composes a display label at render time. The `region`
field has inconsistent values across records (`"New York"` vs `"NY"` vs
`"Washington"` vs `"WA"`), and the label composer does not normalize before
joining.

Both hypotheses point to the same gap: **no canonical location key is used
at the deduplication or filter-matching step**. The fix for both is equivalent
at the presentation layer.

---

## Contributing factors (hypothesized)

1. **No normalization on write** — If location is freeform, the ATS admin UI
   likely has no validation or autocomplete that enforces a consistent format.

2. **Exact-string deduplication** — The frontend builds the filter option list
   using a mechanism equivalent to `new Set(jobs.map(j => j.location))`, which
   treats typographically different strings as distinct even when semantically
   equivalent.

3. **No canonical location key** — No stable identifier (e.g. a `location_id`)
   is used as the deduplication basis, so all uniqueness logic depends on
   string formatting consistency.

4. **No presentation-layer normalization** — Even if the source data is
   inconsistent, a normalization pass at render time would prevent the
   inconsistency from reaching the user.

5. **No regression test for filter deduplication** — A test asserting that
   a known set of synthetic job locations produces N distinct filter options
   would have caught this before release.

---

## Impact assessment

| Dimension | Assessment |
|---|---|
| Candidate UX | Moderate — duplicate options create confusion; filtering by one variant silently excludes jobs filed under the other |
| Recruiter reporting | Low-moderate — location-segmented reports may miscount headcount for affected cities |
| Platform trust | Low — small polish issues in one's own product that are visible to candidates and potential hires |
| Data integrity | None — no data is corrupted; strings are merely inconsistent |
| Security | None |
| Scope | Unclear from public observation; the same codebase likely serves ATS customers, so the defect class may be reproducible in customer tenants |

---

## Proposed remediation

### Immediate — frontend normalization (lowest risk)

Apply `normalizeLocation()` to the filter-build step at render time. This
is a one-line change at the call site and requires no backend changes.

```ts
// Before
const options = [...new Set(jobs.map(j => j.location))];

// After
const options = deduplicateLocations(jobs.map(j => j.location));
```

Risk: near zero. Deterministic string transformation, no API changes, no
schema changes.

### Short-term — server-side normalization on write

Add a normalization and validation step to the job creation and update API.
New records will be clean. Existing records require a migration pass.

### Medium-term — AI-assisted batch canonicalization

Use an LLM to review existing location strings for near-duplicates that
regex normalization may not cover. Output is advisory — a human reviews
and approves before any migration runs. See `scripts/detectNearDuplicateLabels.ts`.

### Long-term — structured location entity

Replace the freeform location field with a structured location record and a
canonical display formatter. Use a location picker backed by a controlled
vocabulary. Deduplication becomes trivial at the schema level.

---

## Prevention

| Action | Rationale |
|---|---|
| Add `normalizeLocation()` to frontend filter build | Prevents duplicates reaching the user regardless of source data state |
| Add E2E test: location filter option count | A test with synthetic jobs and known locations would catch this before release |
| Add fixture validation CI step | `findDuplicateCanonicalLabels()` runs on every push; flags regressions immediately |
| Add near-duplicate AI review step (non-blocking) | Catches edge cases not covered by regex rules; advisory only |
| Define a location display contract | Document the canonical format; make it part of the ATS onboarding contract |

---

## Lessons

**Freeform text fields in admin UIs are normalization debt on a timer.**
Every user who enters a location is a potential source of variance. A
controlled vocabulary with autocomplete is cheap to build and expensive not to.

**Presentation-layer normalization is a cheap safety net.**
Even when source data is inconsistent, normalizing at the display layer
prevents the inconsistency from reaching users. It is not a substitute for
clean source data, but it is a valuable defense-in-depth layer.

**Small inconsistencies in a product you sell are high-signal.**
If a company's own careers page — running on its own ATS product — has a
location deduplication issue visible to job candidates, it is worth asking
whether the same failure class affects customers. Self-dogfooding with
quality monitoring surfaces this kind of signal faster than customer reports.

**The fix-to-impact ratio is extremely high.**
Approximately ten lines of deterministic code, shipped as a frontend change,
eliminates the duplicate dropdown entries for every candidate who visits the
page and for every customer tenant who may be affected.
