# Demo postmortem: duplicate location filter options

This anonymized note describes the synthetic defect demonstrated by the frontend walkthrough. It is intentionally generic and does not reference any real employer, domain, listing, or production system.

## Summary

A careers-style page renders a location filter from raw freeform location labels. Equivalent locations can appear multiple times when the strings differ by whitespace, comma spacing, or full state name versus postal abbreviation.

## Impact

The user-facing issue is small but visible: candidates may see duplicate location options and may not know which option contains the roles they expect. It is a high fix-to-impact polish issue because deterministic normalization can remove ambiguity before rendering.

## Most plausible contributing factor

The behavior is most consistent with a display layer building options directly from raw location strings rather than a canonical display-label contract. In this synthetic demo, the payload is deliberately raw so the frontend normalization point is easy to see.

## Corrective action

Normalize labels before rendering the dropdown:

- trim whitespace;
- collapse repeated spaces;
- normalize comma spacing;
- abbreviate supported state names in region position;
- preserve wrappers such as `Hybrid (...)`;
- deduplicate while preserving first-seen order.

## Regression guard

Unit tests verify the deterministic utility. Browser tests verify that the before scene shows the duplicate class and the after scene shows unique canonical labels.
