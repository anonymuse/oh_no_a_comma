# Forensic Notes — DevTools Investigation Playbook

This document describes how the location inconsistency was identified and how
another engineer could reproduce or extend the investigation. All steps use
standard browser tooling against the public careers page. No authentication,
scraping, or automated requests are involved.

---

## Observed symptom

While browsing `rippling.com/careers`, the location filter dropdown renders
multiple entries for the same city. The entries look nearly identical but are
functionally distinct — selecting one does not return results for the other.

Specifically observed (May 2025):

```
New York , NY                       ← space before comma
New York, NY                        ← correct
Hybrid (New York, New York, US)     ← full state name
Hybrid (New York, NY, US)           ← abbreviated state
Hybrid (Seattle, Washington, US)    ← full state name
Hybrid (Seattle, WA, US)            ← abbreviated state
```

---

## Investigation steps

### Step 1 — Verify the strings are genuinely different

Before assuming a data issue, confirm this is not a visual artifact (line
wrapping, invisible characters, etc.). Run this console probe against the
open dropdown:

```js
Array.from(document.querySelectorAll('[role="option"], li, button'))
  .map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .filter((text) => /New York|Hybrid|Seattle/.test(text));
```

If the output contains strings that look identical, use `.charCodeAt()` to
inspect individual characters:

```js
const a = 'New York , NY';
const b = 'New York, NY';
console.log([...a].map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`));
```

Character 8 of `a` is a space (code 32) where `b` has a comma — confirming
a genuine data difference, not a rendering artifact.

### Step 2 — Inspect the network request

Open DevTools → Network tab. Filter by `Fetch/XHR`. Reload or interact with
the filter to trigger the jobs request. Look for requests to paths containing:

```
jobs, roles, careers, ats, locations, graphql
```

In the observed case, the request shape was approximately:

```
GET https://ats.rippling.com/api/recruiting/jobs?companyId=rippling
```

Response: a JSON array or object containing job records with a `location` field.

### Step 3 — Search the response payload

In the response body, search for:

- `New York`
- `, NY`
- `New York ,` (space before comma — the bug string)
- `New York` (as a state name, inside a hybrid label)
- `Washington` (as a state name)
- `Hybrid`

Create a mapping table:

| Rendered label | Field(s) in payload | Notes |
|---|---|---|
| `New York , NY` | `location: "New York , NY"` | Space before comma |
| `New York, NY` | `location: "New York, NY"` | Canonical form |
| `Hybrid (New York, New York, US)` | `location: "Hybrid (New York, New York, US)"` | Full state name in hybrid label |
| `Hybrid (New York, NY, US)` | `location: "Hybrid (New York, NY, US)"` | Abbreviated state |

### Step 4 — Identify the deduplication logic

In DevTools → Sources (or Elements), search for the filter component's source.
Look for patterns like:

```js
new Set(jobs.map(j => j.location))
// or
[...new Set(locations)]
// or
jobs.reduce((acc, job) => { ... }, {})
```

If `Set` is used directly on raw location strings, this confirms the
deduplication mechanism is exact-string-equality, which cannot distinguish
semantically equivalent variants.

### Step 5 — Formulate hypotheses

See the hypothesis table in `README.md`. The most parsimonious explanation
for the observed variants is one of:

1. **Freeform string input**: The `location` field is entered by a recruiter
   as free text in the ATS admin UI. Different people entered it differently
   with no normalization on save.

2. **Composed label with inconsistent fields**: The ATS stores `city`, `region`,
   and `country` as structured fields, but different job records have `region`
   set to the full state name in some cases and the abbreviation in others.

Both hypotheses produce the same visible symptom and both are addressed by the
normalization approach in this repository.

---

## Forensic hypothesis table

| Hypothesis | Explanation | How to test |
|---|---|---|
| Raw display strings from ATS records | Frontend receives already-formatted location labels and renders directly | Inspect network payloads for `location`, `location_label`, `display_name` |
| Labels composed from structured fields | Frontend builds labels from `city`, `state`, `country`, `workplace_type` without trimming | Compare raw structured fields against rendered dropdown text |
| Mixed state name conventions | Some records use `NY`; others use `New York` | Search payload for both `NY` and `New York` |
| Deduplication uses raw labels | `New York , NY` and `New York, NY` treated as distinct strings | Inspect dropdown option logic; run console probe on option values |
| Hybrid labels assembled by separate code path | Hybrid formatter uses different region representation than office formatter | Compare payload fields for `workplaceType` against rendered hybrid vs office labels |

---

## Reproducing the failure in tests

Convert observations into synthetic fixtures rather than depending on the
live site. See `src/mockAtsPayload.ts` for the fixture set derived from this
investigation.

The first test in each suite in `tests/normalizeLocation.test.ts` maps
directly to an observed variant — this makes the traceability explicit.

---

## What this investigation does not claim

- The live API endpoint shape above is reconstructed from observation. The
  actual field names may differ.
- No internal system, admin UI, or authenticated endpoint was accessed.
- The tech stack inference (React, Python/Django, MongoDB) is based on public
  job postings at `ats.rippling.com/rippling/jobs` and is a plausible
  hypothesis, not a confirmed fact.
- The root cause (freeform input vs. structured field inconsistency) cannot be
  confirmed without access to the backend. Both hypotheses are modeled.
