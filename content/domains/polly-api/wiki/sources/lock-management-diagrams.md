---
title: "Source: Lock Management Diagrams"
type: source
tags: [lock, diagrams, api-only, hybrid, price-exception]
created: 2026-05-02
updated: 2026-05-02
sources: [lock-management-apis-only-approach.md, lock-management-hybrid-approach.md, price-exception.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/integration-patterns.md, wiki/concepts/iframe-pricer-ui.md]
---

# Source: Lock Management Diagrams

**Files:**
- `raw/devhub-guides/lock-management-apis-only-approach.md`
- `raw/devhub-guides/lock-management-hybrid-approach.md`
- `raw/devhub-guides/price-exception.md`

## Summary

Three diagram-only guides. Each contains a single sequence diagram image with no additional text content.

- **APIs Only Approach**: Sequence diagram for end-to-end loan and lock management using exclusively APIs (no iFrame). Shows full flow from loan creation through lock decision.
- **Hybrid Approach**: Sequence diagram for the hybrid pattern — iFrame for pricing and locking, APIs for loan management. Simpler sequence, lower integration complexity.
- **Price Exception**: Flow diagram for the Price Exception API workflow.

## Notes

Image URLs reference `files.readme.io` — images are not downloaded locally. View original source files to see the diagrams.

The conceptual distinctions between these approaches are covered in [[Integration Patterns]] and [[Lock Management Overview]]. These diagrams are visual companions to that written content.
