# AI usage guidance

Generative AI is optional and assistive in this repository. The app, tests, CI, generated Cypher, and validation scripts do not call an AI API and must not require an AI key.

Appropriate AI-assisted uses:

- brainstorm additional malformed locality examples;
- suggest unit-test cases for the deterministic normalizer;
- review diffs for stale docs or inconsistent script names;
- summarize post-deployment anomaly reports created by deterministic monitoring.

Inappropriate uses:

- runtime normalization decisions;
- CI gates that fail when an AI key is missing;
- replacing deterministic tests with probabilistic review;
- introducing real company, ATS, candidate, or job-posting data.

The source of truth remains the TypeScript implementation under `src/lib/location/` plus Vitest and Playwright coverage.
