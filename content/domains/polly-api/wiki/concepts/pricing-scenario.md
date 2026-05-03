---
title: Pricing Scenario
type: concept
tags: [pricing, ppe, eligibility, pricing-scenario, request, response]
created: 2026-05-02
updated: 2026-05-02
sources: [post-pricing-scenario-sample-request.md, parsing-the-pricing-scenario-response.md, determining-eligibility-failures-from-a-pricing-response.md, concepts-and-considerations.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/eligibility-and-pricing-response.md, wiki/concepts/batch-pricing.md, wiki/concepts/custom-parameters.md, wiki/concepts/integration-patterns.md]
---

# Pricing Scenario

The Pricing Scenario API is Polly's core pricing call. Submit borrower, loan, and property data; receive eligible products with rates, prices, adjustments, and eligibility rule results.

**Endpoint:** `POST /api/v2/pe/pricing-scenarios/`  
(Loan-scoped variant: `POST /api/v2/pe/loans/{losLoanId}/pricing-scenarios/`)

---

## Request structure

The request has five top-level sections:

| Section | Purpose |
|---|---|
| `search` | Filter: loan types, amortization types, lock period, terms |
| `borrower` | FICO, DTI, employment, verification method, citizenship, etc. |
| `loan` | Amount, purpose, LTV/CLTV/HCLTV, impounds, FHA/VA/USDA fields |
| `property` | State, county, type, occupancy, address, ZIP |
| `customValues` | Lender-defined custom parameters as name/value pairs |
| `settings` | Control response shape: operations, terse mode, include ineligible |
| `brokerCompPlan` | Broker compensation details |
| `adjustments` | Manual adjustments |

**`audienceId`** (top-level): Specifies the channel. Required when pricing is channel-scoped.

---

## Key request settings

```json
"settings": {
  "operations": ["Eligibility", "Pricing"],
  "returnTerseResponse": true,
  "returnTerseProductResponse": false,
  "returnIneligibleProducts": false
}
```

- `returnTerseResponse: false` + `returnIneligibleProducts: true` — required to see eligibility failure reasons
- `returnTerseProductResponse: false` — required for reprice workflows (returns full rate/price matrix)
- `storeRequestResult: true` — required for reprice-pricing calls to persist a usable `peRequestId`

---

## Response structure

```
$.data
└── id                    ← THIS is the peRequestId for pricing-scenario calls
└── results[]             ← one entry per product
    ├── isEligible
    ├── isValidResult
    ├── invalidResultReason
    ├── ruleResults[]     ← product-level adjustments (global)
    └── prices[]          ← rate/price rows
        ├── price         ← final adjusted price
        ├── netPrice      ← price after rounding + broker comp
        ├── priceAfterBaseAdjustments
        ├── ruleResults[] ← price-row-level adjustments
        └── clampResults[]← min/max enforcement impacts
```

> **`$.data.id` = `peRequestId` for this endpoint only.** Other endpoints (reprice-pricing, product-change-pricing) use different field names. See [[API Contract Quirks]].

---

## Eligibility states

| State | Conditions |
|---|---|
| Eligible | `isEligible == true`, `isValidResult == true`, `prices[]` is non-empty |
| Ineligible | `isEligible == false`, `isValidResult == true` |
| Invalid | `isValidResult == false` — check `invalidResultReason` |

To understand why a product is ineligible, inspect `ruleResults[]` where `category = "Eligibility"` or `category = "EligibilityMatrix"`. For `EligibilityMatrix` rules (ID prefix `EM-`), additional API calls can retrieve row-level failure details.

---

## Price calculation summary

```
FinalPrice = BasePrice + VisibleAdjustments - ClampAdjustments
```

Where:
- **BasePrice** = `priceAfterBaseAdjustments` + hidden price-level adjustments (`isHiddenAdjustment=true`, `target="Price"`, `booleanEquationValue=true`)
- **VisibleAdjustments** = sum of `resultEquation` where `isHiddenAdjustment=false`, `booleanEquationValue=true`, `target="Price"`, category in `["Adjustments", "SRP", "Margin"]` — from **both** product-level and price-row-level ruleResults
- **ClampAdjustments** = sum of `(unclamped - clamped)` in `clampResults[]` where `target="Price"`, category in `["Adjustments", "SRP", "Margin"]`

`netPrice` = `price` + rounding rules + broker comp adjustments.

See [[Eligibility and Pricing Response]] for full parsing detail.

---

## Enumeration format

The pricing engine converts string enumerations to integers internally. When reading eligibility rule results, values are integers. A full mapping table (Loan.Purpose, Property.Occupancy, Property.PropertyType, Borrower.VerificationMethod, etc.) is in `raw/devhub-guides/determining-eligibility-failures-from-a-pricing-response.md`.

Notable: `Borrower.VerificationMethod` had 3 new enumerations added April 22, 2026.

---

## Changeset context

Pricing runs against the **currently active pricing version** (changeset) by default. To run against a historical version (needed for product change hypotheticals), pass `changesetId` in the request. See [[Product Change Workflow]] for when this matters.

---

## Custom parameters

Custom parameters (lender-defined fields) are sent in `customValues[]` as name/value pairs. Missing custom parameters can affect eligibility. Pull the current parameter list from the Pricing Engine (not Loan Service) before building your pricing payload. See [[Custom Parameters]].
