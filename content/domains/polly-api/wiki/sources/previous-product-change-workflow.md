---
title: "Source: Previous Product Change Workflow (Legacy)"
type: source
tags: [lock, product-change, legacy, historical-pricing, hypothetical]
created: 2026-05-02
updated: 2026-05-02
sources: [previous-product-change-workflow.md]
related: [wiki/concepts/product-change-workflow.md, wiki/concepts/pricing-scenario.md]
---

# Source: Previous Product Change Workflow (Legacy)

**File:** `raw/devhub-guides/previous-product-change-workflow.md`

> **Status:** Marked as outdated in the guide, but retained on the developer hub for integrators who need it.

## Summary

Documents the product change workflow used before December 2024, which used `POST /pricing-scenario/` with manual changesetId handling for current/historical/worst-case pricing. Still valid and still needed for specific use cases.

## When this is still needed

The new `product-change-pricing` API handles pricing internally and commits to the product change. The **legacy approach using `POST /pricing-scenario/`** is still the only way to:
- Run **hypothetical pricing** on a locked loan (evaluate what a product change would look like without committing)
- Manually reconstruct worst-case pricing by running both current and historical scenarios and comparing

Use the legacy flow when you need to evaluate options without actually changing the lock.

## Steps

1. `GET /pe/loans/{loanId}/product-change-mapping/` — find mapped products
2. `POST /pe/pricing-scenarios/` with `productCodesOrIds` and optionally `changesetId` (historical) — 3 sub-variants: current, historical, worst-case (run both, compare prices)
3. `POST /pe/loans/{loanId}/product-change/` — submit the selected change

## What this updates in the wiki

- "Legacy workflow" section in [[Product Change Workflow]]
