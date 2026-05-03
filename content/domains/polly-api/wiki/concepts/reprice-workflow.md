---
title: Reprice Workflow
type: concept
tags: [lock, reprice, post-lock, pricing]
created: 2026-05-02
updated: 2026-05-02
sources: [reprice-pricing-workflow.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/pricing-scenario.md, wiki/concepts/relock-workflow.md, wiki/concepts/api-contract-quirks.md, wiki/entities/polly-loan-service.md]
---

# Reprice Workflow

Repricing is used when **loan data changes after a rate is locked** (e.g., updated FICO, property value, loan amount). The reprice recalculates pricing against the existing lock context — including the original lock date, rate set, extension fees, concessions, and adjustments.

> Available since ~June 2025. Prior to this, integrators used `POST /pricing-scenario/` with manual reconstruction of the full pricing payload. That older approach still works but is more error-prone (see Legacy Reprice Note below).

---

## Preconditions

- A rate has already been locked on the loan.

---

## Steps

### 1. Update the Loan Service (if applicable)

`PATCH /api/v2/loans/{losLoanId}`

Update loan attributes with the new data (e.g., FICO change). The snapshot must be current before calling reprice-pricing.

```json
{ "borrower": { "fico": 750 } }
```

### 2. Request Reprice Pricing

`POST /api/v2/pe/loans/{losLoanId}/reprice-pricing/`

Polly recalculates pricing using the stored lock context. No need to reconstruct fees, adjustments, or concessions.

```json
{
  "settings": {
    "operations": ["Pricing", "Eligibility"],
    "storeRequestResult": true,
    "returnIneligibleProducts": false,
    "returnTerseProductResponse": false,
    "returnTerseResponse": true
  }
}
```

**`storeRequestResult: true` is required** — without it, no `peRequestId` is returned for use in Step 3.
**`returnTerseProductResponse: false` is required** — without it, you only get the par price.

**Response key paths:**
- `$.data.peRequestId` ← the ID for Step 3 (note: NOT `$.data.id` — see [[API Contract Quirks]])
- `$.data.results[0].prices[]` ← all rate/price combos
- `$.data.results[0].code` ← product code (required in Step 3)

Response contains a single product (the locked product), unlike a full pricing scenario.

### 3. Commit the Reprice

`POST /api/v2/pe/loans/{losLoanId}/reprice/`

```json
{
  "requestAndApprove": true,
  "allowExpiredResult": false,
  "peRequestId": "69127a700d707ea8d9b4f23e",
  "productCode": "PRD/1234-55",
  "rate": "6.375",
  "lockPeriod": 45
}
```

Optional: `?isPreview=true` to preview the reprice without persisting it.

Submitting a rate not returned from Step 2 returns a 422.

---

## Webhook events

- `lock.repriceLockRequestSubmitted`
- `lock.repriceLockRequestApproved`
- `lock.repriceLockRequestDenied`
- `lock.confirmationDocumentGenerated` (follows approval)

---

## Legacy reprice (pre-June 2025)

Some integrations still use `POST /pricing-scenario/` to generate a pricing result for reprice submission. If using this approach, you **must** include `initialLockDateTime` in the pricing-scenario request body. If omitted, Polly defaults it to `now()`, which can cause time-sensitive eligibility or pricing rules to behave incorrectly.

---

## Key developer notes

- `$.data.peRequestId` vs `$.data.id`: reprice-pricing explicitly labels the field `peRequestId`. Do not use `$.data.id` from a pricing-scenario response as input here.
- The reprice-pricing response always returns a single product record (the locked product), not the full product matrix.
