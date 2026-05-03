---
title: "Source: Product Change Workflow"
type: source
tags: [lock, product-change, post-lock]
created: 2026-05-02
updated: 2026-05-02
sources: [product-change-workflow.md]
related: [wiki/concepts/product-change-workflow.md, wiki/concepts/api-contract-quirks.md]
---

# Source: Product Change Workflow

**File:** `raw/devhub-guides/product-change-workflow.md`

## Summary

Current product change guide (Dec 2024+). 3 steps: get product change mapping, request product-change-pricing, submit product change. Includes known issues with the swagger spec and the productCodesOrIds filter.

## Key claims

- `product-change-pricing` endpoint currently returns all mapped products regardless of `productCodesOrIds` filter (known issue)
- Swagger missing: `$.data.results[].peRequestId` and `$.data.results[].pricingModeLogic`
- `pricingModeLogic` values: `HistoricalPricing`, `CurrentPricing`, `WorseCasePricing`
- Product mapping API returns product codes; pricing response returns product IDs
- Use product-level `peRequestId`, not root-level
- Step 3 response includes both `currentLock` and `lockAfterProductChange`

## What this updates in the wiki

- Primary source for [[Product Change Workflow]] and [[API Contract Quirks]]
