# Synthetic postmortem: fragmented locality filters

This is a generic postmortem for the synthetic demo in this repository. It does not describe a real employer, ATS vendor, domain, API, screenshot, or job listing.

## Summary

A careers-style page renders locality filter options from raw ATS-style strings. Equivalent places can appear as separate options when raw values differ by comma spacing, repeated whitespace, or full state name versus state abbreviation. In the fixture, `New York , NY` appears as a one-job raw node beside a larger `New York, NY` cluster.

## Impact

The defect is visually small but publicly noticeable. Candidates may see duplicate location choices, and raw-string filtering can fragment results so that one equivalent job appears under a different option.

## Contributing factors

- The public UI treats raw display labels as identity.
- The boundary contract does not provide a canonical locality key.
- Human-entered, customer-configured, migrated, pasted, or integrated values are assumed to be perfectly formatted.

## Corrective action

- Normalize display labels before rendering.
- Generate canonical keys for deduplication and matching.
- Preserve raw input for audit and graph-based review.
- Add deterministic tests for normalization, deduplication, canonical-key filtering, graph model generation, and Cypher generation.

## Prevention

The better boundary design is to emit both raw values and canonical fields: raw value for audit/debugging, normalized label for display, and canonical key for identity. AI can help brainstorm edge cases and review anomalies, but deterministic tests remain the source of truth.
