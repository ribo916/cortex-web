---
title: Product Change Workflow
type: concept
tags: [lock, product-change, post-lock, worst-case-pricing, historical-pricing]
created: 2026-05-02
updated: 2026-05-02
sources: [product-change-workflow.md, previous-product-change-workflow.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/reprice-workflow.md, wiki/concepts/api-contract-quirks.md, wiki/concepts/pricing-scenario.md]
---

# Product Change Workflow

A product change enables a **locked product to be swapped for a mapped alternative** while maintaining consistent lock policies and pricing logic. For example, moving from a 30-year fixed to a 25-year fixed after lock.

> **Current workflow** (December 2024+): Use the `product-change-pricing` API — Polly handles pricing logic internally.  
> **Legacy workflow** (pre-December 2024): Still supported for hypothetical pricing scenarios. See [Legacy Workflow](#legacy-workflow-pre-december-2024) below.

---

## Preconditions

- A rate is already locked on the loan.
- The organization has configured product change mappings (eligible "to-products") in Polly's PPE.

---

## Steps (current workflow)

### 1. Retrieve allowed product mappings

`GET /api/v2/pe/loans/{loanId}/product-change-mapping/`

Returns which product swaps are allowed and what pricing logic applies to each.

**Key response fields per mapping:**

| Field | Description |
|---|---|
| `fromProduct` | Currently locked product ID |
| `toProducts[]` | Eligible swap targets |
| `pricingLogic` | `CurrentPricing`, `HistoricalPricing`, or `WorseCasePricing` |
| `isAutoApproved` | Whether Polly will auto-approve the change |

> Note: This API returns product **codes**, not product IDs. The product-change-pricing response returns product IDs — keep both in mind when cross-referencing.

### 2. Request product change pricing

`POST /api/v2/pe/loans/{losLoanId}/product-change-pricing/`

```json
{
  "search": {
    "productCodesOrIds": ["68D186F94A6D13C136F26C86", "..."],
    "loanTypes": ["Conventional"]
  },
  "settings": {
    "operations": ["Eligibility", "Pricing"],
    "returnIneligibleProducts": true
  }
}
```

> **Known issue:** This endpoint currently returns all mapped products regardless of the `productCodesOrIds` filter. Use Step 1 to determine eligible products; filter on your side. See [[API Contract Quirks]].

**Response key paths (undocumented in Swagger):**
- `$.data.results[x].pricingModeLogic` — `HistoricalPricing`, `CurrentPricing`, or `WorseCasePricing`
- `$.data.results[x].peRequestId` — required for Step 3 (product-level, not root-level)
- `$.data.results[x].prices[]` — rate/price matrix for that product
- `$.data.results[x].id` — product ID

### 3. Submit product change

`POST /api/v2/pe/loans/{loanId}/product-change/`

```json
{
  "peRequestId": "690e5ac1783635c21ec9afa2",
  "productId": "68D18703FB3681099562DF64",
  "rate": 7.99
}
```

Response includes both `currentLock` (the prior lock state) and `lockAfterProductChange` (the new lock), including the new `lockRequestId` and `autoApproved` status.

---

## Webhook events

- `lock.productChangeRequestSubmitted`
- `lock.productChangeRequestApproved`
- `lock.productChangeRequestDenied`
- `lock.confirmationDocumentGenerated` (follows approval)

---

## Legacy workflow (pre-December 2024)

The legacy approach is still valid for **hypothetical pricing on locked loans** — scenarios where you want to evaluate what-if pricing without actually committing a product change.

**Steps:**
1. `GET /pe/loans/{loanId}/product-change-mapping/` — find mapped products
2. Run `POST /pricing-scenario/` with `losLoanId` and `productCodesOrIds`:
   - **Current pricing:** leave `changesetId` blank (defaults to current version)
   - **Historical pricing:** pass `changesetId` of the version used for the last lock action
   - **Worst-case pricing:** run both current and historical, compare, take the worse price
3. `POST /pe/loans/{loanId}/product-change/` — submit the change

> **Why the legacy flow is still needed:** The new `product-change-pricing` API commits to the product change internally. If you want to run pricing hypotheticals against a locked loan (e.g., "what would this product cost at historical pricing?") without actually changing the lock, the legacy `POST /pricing-scenario/` path is the only option — it allows data manipulation and historical changesetId evaluation that the new dedicated API doesn't expose.

---

## Key developer notes

- `$.data.results[x].peRequestId` is the correct field for Step 3 input — not the root-level `peRequestId`. See [[API Contract Quirks]].
- The product-change-pricing response is large. Key fields (`peRequestId`, `pricingModeLogic`) are not in the Swagger spec.
- Both `currentLock` and `lockAfterProductChange` are returned in the Step 3 response — useful for showing the user a before/after comparison.
