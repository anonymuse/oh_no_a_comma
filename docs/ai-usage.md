# AI Usage in This Project

This document describes how and where AI was used, and — equally important —
where it was deliberately not used. Making this explicit is part of the
engineering judgment being demonstrated.

---

## Principle: AI assists, determinism decides

The core normalization logic in this project (`normalizeLocation.ts`,
`dedupeLocations.ts`) is deterministic, fully tested, and does not call any
external service. It will produce the same output for the same input every
time, in CI, in production, and on an engineer's laptop at 2am.

AI is used in one place: the `detectNearDuplicateLabels.ts` script, which
asks Claude to identify semantically similar location strings that the regex
rules may not yet cover. That script runs as a **non-blocking** CI step. It
annotates. It does not gate.

The reasoning: LLM outputs are probabilistic. Using them as a hard gate on a
release pipeline introduces non-determinism that degrades CI reliability over
time. Their value here is catching the *next* edge case — the one that isn't
in the fixture set yet — and surfacing it for a human to decide whether a new
normalization rule is warranted.

---

## Appropriate uses in this project

| Use | Where | Notes |
|---|---|---|
| Near-duplicate label detection | `scripts/detectNearDuplicateLabels.ts` | Non-blocking, advisory output |
| Postmortem language drafting | `POSTMORTEM.md` | Human-reviewed before publishing |
| Edge case suggestion | Informed test case design | Human decided whether to include |
| Investigation summarization | Informed `docs/forensic-notes.md` | Human-verified against actual observations |

---

## Inappropriate uses — explicitly avoided

| Use | Why avoided |
|---|---|
| Replacing deterministic normalization | LLM outputs are probabilistic; normalization must be testable and reproducible |
| Asserting confirmed root causes | Claude has no access to the backend; it can only reason from the same public evidence a human has |
| Making unsupervised changes to canonical geography mappings | Geography is ground truth data; LLM hallucination here would introduce bugs, not fix them |
| Hard CI gate on AI output | Introduces non-determinism into the release pipeline |
| Inventing API response field names | Only observed fields are documented; inferred fields are labeled as inferred |

---

## A note on using AI to build this project

Claude was used as a coding and analysis assistant throughout this project —
for drafting code, structuring the investigation narrative, and pressure-testing
the normalization logic against edge cases. That use is noted here in the
interest of transparency.

The outputs were reviewed, tested, and in several cases revised before being
included. The test suite was written with the constraint that observed bugs
appear as the first test cases in each suite — meaning the tests are grounded
in real observation, not generated from a prompt asking for "comprehensive
test coverage."

The distinction that matters to this project's purpose: AI was used as a
*tool* under human direction, not as an autonomous agent producing artifacts
to be published without review. That is the engineering posture being
demonstrated here as much as any technical implementation.
