# AGENTS.md — ats-location-canonicalization

Read this file before touching anything. It is the complete context for this
Codex coding session. The project has scaffolding in place; your job is to bring it
to a clean, runnable, publishable state.

---

## What this project is

A portfolio case study demonstrating engineering judgment on a data quality
problem. The subject is a real, publicly observable UX defect on
`rippling.com/careers`: the location filter dropdown renders duplicate entries
for the same city because location strings are stored as freeform text with no
normalization.

This repository is being prepared for submission alongside a job application
for Director of Engineering – Platform at Rippling. It should read like the
work product of a senior platform engineer — precise, grounded, and showing
good judgment about what can and cannot be claimed from public evidence alone.

**Critical framing**: this is not a bug report. It is a demonstration of
engineering posture. The README says this explicitly and you must preserve
that framing throughout.

---

## What was observed (do not change this)

On the public careers page, the location filter dropdown contains:

```
New York , NY                        ← space before comma
New York, NY                         ← correct
Hybrid (New York, New York, US)      ← full state name
Hybrid (New York, NY, US)            ← abbreviated state
Hybrid (Seattle, Washington, US)     ← full state name
Hybrid (Seattle, WA, US)             ← abbreviated state
```

These were observed via browser DevTools on the public page. No authenticated
systems were accessed. All test fixtures are synthetic.

---

## Epistemic constraints (do not violate these)

1. **Do not assert confirmed root causes.** Everything about the backend is
   a hypothesis. Use language like "plausible", "likely", "hypothesized",
   "most consistent with". Never write "root cause confirmed" or "MongoDB
   stores..."  as a statement of fact.

2. **Do not invent API field names or response shapes** beyond what is
   documented in `docs/forensic-notes.md`. If you need to reference a field
   name, use the observed approximate shapes and label them as inferred.

3. **Do not claim confirmed access to the live API.** The audit script
   attempts a fetch and falls back gracefully to fixtures. Document that
   the endpoint may be auth-gated.

4. **AI is non-blocking.** The `detectNearDuplicateLabels.ts` script must
   exit 0 unconditionally. It is advisory. Do not let it gate anything.

---

## Architecture decisions (do not reverse these)

These were deliberate choices made after reviewing two separate analyses.
Do not reverse them without a strong reason.

| Decision | Rationale |
|---|---|
| TypeScript + Vitest, not JS + Jest | More appropriate for a platform engineering portfolio; idiomatic for TS projects |
| `locationTypes.ts` models both data shapes | Hypothesis A (freeform string) and B (structured fields) are both modeled — shows systems thinking |
| Three-pass deterministic normalization | Each pass is independently testable; composable |
| `dedupeLocations.ts` split from `normalizeLocation.ts` | Separation of concerns: string transform vs. collection operations |
| AI as non-blocking advisory step | LLM outputs are probabilistic; never gate CI on them |
| Fixture validation as a blocking CI step | Deterministic checks gate the build; catches regressions before release |
| Observed bugs as first test cases in each suite | Grounds the tests in real evidence; makes traceability to the problem explicit |

---

## Files that exist and their status

Review each file before making changes. Assume existing content is correct
unless a specific problem is found.

```
README.md               Complete. Do not rewrite the framing. Minor improvements OK.
POSTMORTEM.md           Complete. Uses hypothesis language throughout. Preserve this.
CLAUDE.md               Original Claude-oriented guidance.
AGENTS.md               This file; Codex-oriented equivalent guidance.

src/locationTypes.ts    Complete. AtsLocationRecord interface, CanonicalLocation,
                        NormalizationAuditResult. Do not add new types without need.

src/normalizeLocation.ts
                        Complete. Three-pass normalization + composeLabelFromRecord.
                        Check: does it handle the tsx import paths correctly for the
                        module system? Verify .js extensions on imports for ESM.

src/dedupeLocations.ts  Complete. deduplicateLocations, filterByLocation,
                        buildAuditReport, findDuplicateCanonicalLabels.

src/mockAtsPayload.ts   Has a syntax error — a stray comma in the MOCK_JOBS array.
                        FIX THIS FIRST before running tests.

src/components/LocationFilter.tsx
                        Complete. Component + useLocationFilter hook.

tests/normalizeLocation.test.ts
                        Complete. Observed bugs are first test cases in each suite.

tests/dedupeLocations.test.ts
                        Complete.

tests/fixtureValidation.test.ts
                        Complete. This is the CI fixture guard.

scripts/auditLocations.ts
                        Complete. Fetches public jobs or falls back to fixtures.

scripts/detectNearDuplicateLabels.ts
                        Complete. Non-blocking AI advisory script.

docs/forensic-notes.md  Complete. DevTools playbook + hypothesis table.
docs/ai-usage.md        Complete. GenAI governance rationale.

package.json            Complete. tsx for scripts, vitest for tests.
tsconfig.json           Complete.
vitest.config.ts        Complete.
.gitignore              Complete.
.github/workflows/ci.yml  Complete. Typecheck → tests → fixture validation → AI advisory.
```

---

## Known issues to fix first

### 1. Syntax error in `src/mockAtsPayload.ts`

There is a stray comma in the `MOCK_JOBS` array around the `Austin, TX` entry.
Fix before attempting to run tests.

### 2. ESM import paths

All internal imports in `.ts` files must use `.js` extensions (not `.ts`) for
Node ESM to resolve them correctly at runtime. This is TypeScript's behavior
with `"moduleResolution": "NodeNext"`. Verify all imports in `src/` and
`tests/` use `.js` extensions. Example:

```ts
// Correct
import { normalizeLocation } from '../src/normalizeLocation.js';

// Wrong — will fail at runtime even though .ts file exists
import { normalizeLocation } from '../src/normalizeLocation';
```

### 3. React peer dependency

`LocationFilter.tsx` imports from `react`. The package.json does not include
React as a dependency because this component is illustrative, not a runnable
app. Add a note in the component file confirming this expectation and ensure
`@types/react` is in devDependencies (it already is).

---

## What "done" looks like

A reviewer can:

1. Clone the repo.
2. Run `npm install && npm test` — all tests pass, coverage report generated.
3. Run `npm run validate` — fixture validation passes (no duplicate canonicals).
4. Run `npm run audit` — produces a readable normalization delta report.
5. Run `npm run typecheck` — no TypeScript errors.
6. Read `README.md` in under 5 minutes and understand the full case study.
7. Read `POSTMORTEM.md` and see a credible, well-framed P3 post-mortem.
8. Read the source files and see idiomatic, well-commented TypeScript.

---

## Suggested Codex planning sequence

Use the Codex plan tool before writing any code for substantive changes. Work through these prompts in order:

**Prompt 1** — Audit and fix
> "Review all files. Fix the syntax error in mockAtsPayload.ts. Verify all
> ESM import paths use .js extensions. Run tsc --noEmit and fix any type
> errors. Do not change logic or framing — only fix mechanical issues."

**Prompt 2** — Verify tests pass
> "Run npm test. Show me the output. If any tests fail, fix the root cause
> without changing the test assertions — the tests describe correct behavior."

**Prompt 3** — Validate CI chain
> "Run npm run validate. Run npm run typecheck. Fix any issues. Confirm
> the fixture validation test passes and the CI workflow file is syntactically
> valid YAML."

**Prompt 4** — Review and tighten
> "Do a final review pass across all files. Flag any place where language
> overclaims about the root cause (anything stated as confirmed fact rather
> than hypothesis). Flag any import that could fail at runtime. Flag any
> TypeScript error the compiler would catch. Produce a list of issues — do
> not fix them yet."

**Prompt 5** — Fix and finalize
> "Apply the fixes from Prompt 4. Then produce a single git commit message
> for the initial commit that accurately describes what this project is."

---

## Tone and voice reminders

- Hypothesis language throughout: "likely", "plausible", "most consistent with"
- Confident and precise — not hedging in a way that sounds uncertain about
  the *engineering*, only about the *unconfirmed backend facts*
- The "Positioning for Reviewers" section in README.md is the north star —
  the whole project should feel like a demonstration of that posture
- Do not add filler prose to pad file lengths
- Do not describe the fix as solving "a critical bug" — it is a polish issue
  with high fix-to-impact ratio

---

## Reference material

Two analyses informed this project's design:

1. **Original scaffolding** — built from DevTools investigation, with working
   implementation and post-mortem. Stronger on code depth and test coverage.

2. **Second analysis** (the other agent's README) — stronger on epistemic
   framing, TypeScript approach, and the principle that AI should be
   non-blocking in CI. The `AtsLocationRecord` interface, the hypothesis
   table, the Vitest choice, and the "Positioning for Reviewers" framing
   all came from that analysis.

The current state of this repository incorporates the best of both.
