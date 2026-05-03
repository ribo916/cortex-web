---
title: Relock Workflow
type: concept
tags: [lock, relock, worst-case-pricing, post-lock]
created: 2026-05-02
updated: 2026-05-02
sources: [relock.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/reprice-workflow.md, wiki/concepts/api-contract-quirks.md]
---

# Relock Workflow

A relock re-establishes a pricing commitment after a prior lock has **expired or been cancelled**. The loan still exists and may proceed to closing, but there is no active pricing commitment. A relock creates a new lock while retaining the prior lock's history.

---

## Key concept: Worst-Case Pricing (WCP)

When a relock occurs within the configured **worst-case pricing window**, Polly enforces worst-case pricing — the worse of the original lock price and current market pricing. This prevents borrowers or lenders from gaming expiration/cancellation to obtain better pricing.

After the WCP window expires, relock pricing resets to current market pricing.

The `wcpExpiryDate` in Step 1's response tells you exactly when this window ends.

---

## Steps

### 1. Retrieve lock policies

`GET /api/v2/pe/loans/{losLoanId}/lock-policies/?lockAction=Relock`

**Use to:**
- Confirm the loan is eligible for a relock (422 if not — see error examples)
- Find allowed relock lock periods
- Determine if worst-case pricing applies and until when

**Example response:**
```json
{
  "relock": {
    "maxRelocksPermitted": 2,
    "relockLockPeriods": [15, 30, 45],
    "wcpExpiryDate": "2026-01-17",
    "currentPricingLockPeriods": null,
    "relockPeriodSettings": {
      "expiry": { "daysExpiredOperator": ">", "daysExpired": 0 },
      "locked": { "daysLockedOperator": "<", "daysLocked": 45 }
    }
  }
}
```

`currentPricingLockPeriods` is non-null only after WCP expiry — it shows the periods available when pricing has reset to current market.

**422 errors to handle:**
- `"Loan has already exceeded a max number = N of relocks allowed per a policy."`
- `"Lock request is not expired or not in a cancelled status"`

### 2. Request relock pricing

`POST /api/v2/pe/loans/{losLoanId}/relock-pricing/`

Input: `loanId`, `relockPeriod` (must be from the valid list in Step 1).

**Response shape varies:**
- Within WCP window: `$.data.results[]` contains a **single record** (worst-case product only)
- Outside WCP window: `$.data.results[]` contains **multiple records** (current market, full product list)

**Use:** `$.data.results[x].peRequestId` — product-level, not root-level. See [[API Contract Quirks]].

### 3. Submit relock

`POST /api/v2/pe/loans/{losLoanId}/relock/`

Input: `loanId`, `relockPeriod`, `peRequestId` (from Step 2 product-level), `rate` (from Step 2).

**Response:**
```json
{
  "priorLock": { "lockRequestId": "...", "rate": "6.000", "finalPrice": "102.024", ... },
  "relockLock": { "lockRequestId": "...", "rate": "6.000", "finalPrice": "101.824", "autoApproved": true, ... }
}
```

The response includes both the prior lock record and the new relock details.

---

## Webhook events

- `lock.relockRequestSubmitted`
- `lock.relockRequestApproved`
- `lock.relockRequestDenied`
- `lock.confirmationDocumentGenerated` (follows approval)

---

## Customer configuration

Customers can configure multiple relock policies and apply them to specific products. Configurable settings include:
- Maximum relocks permitted
- Allowed lock periods
- WCP window duration
- Rules for minimum days expired before relock is permitted
