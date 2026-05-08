# Repository guidance

- Keep this repo anonymized and synthetic.
- Treat `README.md` as the product spec for the locality-normalization case study.
- Keep location-domain logic centralized in `src/lib/location/`.
- Do not add runtime AI dependencies or real employer / ATS / job data.
- Keep CI deterministic: typecheck, unit tests, build, graph Cypher generation, and Playwright walkthrough checks.
