---
title: "Source: Relock Workflow"
type: source
tags: [lock, relock, worst-case-pricing]
created: 2026-05-02
updated: 2026-05-02
sources: [relock.md]
related: [wiki/concepts/relock-workflow.md]
---

# Source: Relock Workflow

**File:** `raw/devhub-guides/relock.md`

## Summary

Guide for relocking a loan after expiration or cancellation. 3 steps: retrieve lock policies, request relock pricing, submit relock. Covers worst-case pricing window, policy config options, example responses, and 422 error messages.

## Key claims

- Worst-case pricing applies until `wcpExpiryDate`; after that, current market pricing
- Within WCP: single product returned; outside WCP: full product list
- Use product-level `peRequestId`, not root-level
- 422 errors: max relocks exceeded, loan not in expired/cancelled state
- Customers can configure multiple relock policies with different product applicability

## What this updates in the wiki

- Primary source for [[Relock Workflow]]
