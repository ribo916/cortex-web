---
title: "Source: Reprice Pricing Workflow"
type: source
tags: [lock, reprice, post-lock]
created: 2026-05-02
updated: 2026-05-02
sources: [reprice-pricing-workflow.md]
related: [wiki/concepts/reprice-workflow.md]
---

# Source: Reprice Pricing Workflow

**File:** `raw/devhub-guides/reprice-pricing-workflow.md`

## Summary

Guide for repricing a locked loan using the dedicated Reprice Pricing API (available since ~June 2025). Covers 3 steps: update loan, request reprice-pricing, commit reprice. Compares to legacy approach using pricing-scenario.

## Key claims

- `storeRequestResult: true` required to get a usable `peRequestId` in the response
- `returnTerseProductResponse: false` required for full rate/price matrix
- Response uses `$.data.peRequestId` (not `$.data.id` like pricing-scenario)
- Legacy approach (`POST /pricing-scenario/`) still works but requires `initialLockDateTime` if used for reprice; omitting defaults to `now()` and can break time-sensitive rules
- `?isPreview=true` query param on reprice endpoint lets you preview without persisting

## What this updates in the wiki

- Primary source for [[Reprice Workflow]]
