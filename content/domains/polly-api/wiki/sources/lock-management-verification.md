---
title: "Source: Lock Management Verification"
type: source
tags: [lock, verification, fields, government-loans]
created: 2026-05-02
updated: 2026-05-02
sources: [lock-management-verification.md]
related: [wiki/concepts/lock-management-overview.md, wiki/entities/polly-loan-service.md]
---

# Source: Lock Management Verification

**File:** `raw/devhub-guides/lock-management-verification.md`

## Summary

Reference for which fields Polly compares between a lock/reprice/relock/extension/product-change/price-exception request and the loan record. Discrepancies cause the request to be rejected. Covers core fields (always verified) and government loan–specific fields (FHA, USDA, VA).

## Key claims

- Verification applies to: initial lock, reprice, relock, extension, product change, price exception
- Discrepancy → request rejected → loan must be updated to match pricing request before resubmitting
- Government loan fields are only verified when loan type matches the program (FHA/USDA/VA)
- Core always-verified fields include: `amount`, `ltv`, `productCode`, `desiredLockPeriod`, `aus`, `impounds`, `occupancy`, `state`, `county`, `fico`, `dtiRatio`, and ~20 others

## What this updates in the wiki

- Referenced in [[Lock Management Overview]]; full field list stays in raw source
