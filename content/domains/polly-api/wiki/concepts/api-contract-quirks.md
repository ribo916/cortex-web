---
title: API Contract Quirks
type: concept
tags: [api, quirks, gotchas, swagger, enumerations, contract]
created: 2026-05-02
updated: 2026-05-02
sources: [reprice-pricing-workflow.md, product-change-workflow.md, parsing-the-pricing-scenario-response.md, polly-loan-service-overview.md, pricing-using-our-batch-apis.md, determining-eligibility-failures-from-a-pricing-response.md]
related: [wiki/concepts/pricing-scenario.md, wiki/concepts/lock-management-overview.md, wiki/concepts/reprice-workflow.md, wiki/concepts/product-change-workflow.md, wiki/concepts/custom-parameters.md]
---

# API Contract Quirks

A reference for known inconsistencies, underdocumented behaviors, and Swagger gaps that developers regularly hit. This page is a supplement to the official API reference — it covers what the docs miss or get wrong.

---

## `peRequestId` location is inconsistent across endpoints

The pricing engine request ID is needed for lock submissions, reprices, and other post-pricing calls, but where it appears in the response body varies:

| Endpoint | Where to find `peRequestId` |
|---|---|
| `POST /pe/pricing-scenarios/` | `$.data.id` (NOT `peRequestId`) |
| `POST /pe/loans/{id}/reprice-pricing/` | `$.data.peRequestId` (explicitly labeled) |
| `POST /pe/loans/{id}/relock-pricing/` | `$.data.results[x].peRequestId` — use product-level, **not** `$.data.peRequestId` |
| `POST /pe/loans/{id}/product-change-pricing/` | `$.data.results[x].peRequestId` — use product-level, **not** `$.data.peRequestId` |

**Rule:** For any post-lock workflow (reprice, relock, product change), use the product-level `peRequestId`. The root-level value, when present, is not what the subsequent lock call expects.

---

## Product change pricing ignores `productCodesOrIds` filter

`POST /pe/loans/{losLoanId}/product-change-pricing/` accepts a `search.productCodesOrIds` array but currently returns **all mapped products** regardless of what you pass in. The guide acknowledges this as a known issue to be resolved in a future release.

**Workaround:** Always call `GET /pe/loans/{loanId}/product-change-mapping/` first (Step 1), then filter results on your side after receiving the full product list from the pricing call.

---

## Swagger is missing key fields in product change pricing response

The OpenAPI spec for `POST /pe/loans/{losLoanId}/product-change-pricing/` does not document two fields you need:

- `$.data.results[].peRequestId` — required for the subsequent product change submission
- `$.data.results[].pricingModeLogic` — tells you which pricing logic was applied (`CurrentPricing`, `HistoricalPricing`, `WorseCasePricing`)

These are present in the actual response but absent from the spec. Don't rely on Swagger alone for this endpoint.

---

## Enumeration type mismatches between Loan Service and Pricing Engine

Custom parameters shared between the Loan Service and Pricing Engine use different enumeration type names for the same concept. For example, a boolean custom parameter:
- Pricing Engine API returns: `Boolean`
- Loan Service API returns: `BooleanType`

Additionally, the Loan Service `Configuration: Loan Management` API returns parameter descriptions as `"Parameter added from pricing version"` rather than the human-readable description configured by the customer. The Pricing Engine API returns the real description.

**Rule:** For any integration focused on pricing, eligibility, or locking, always pull custom parameter definitions from the **Pricing Engine** (`/pe/custom-parameters/`), not from Loan Service Configuration. See [[Custom Parameters]] for the full reasoning.

---

## Auth endpoint not in OpenAPI spec

`POST /api/v2/auth/token/` is not included in the Polly OpenAPI 3.0 spec or Swagger import. If building from the OpenAPI spec (e.g., importing into Postman), you must manually add the authentication endpoint. A ready-to-import cURL is in the [[Authentication]] guide.

---

## Batch API uses single-quote as CSV quote character

The batch pricing CSV format uses `'` (single quote) as its quote character, not the more common `"` (double quote). This is intentional — the API response data contains characters that require escaping, and the format follows standard CSV quoting rules with single quotes.

Some cells may not be surrounded by quotes if they don't require escaping, which is also correct CSV behavior. Do not expect all cells to be uniformly quoted.

---

## LLPA rules at price-row level are easy to miss

The pricing response has two levels of `ruleResults`:
- `$.data.results[x].ruleResults[]` — product-level (global) adjustments
- `$.data.results[x].prices[y].ruleResults[]` — price-row-level adjustments (rate or investor dependent)

Some LLPA rules — especially those dependent on rate, investor, or price-row logic — appear **only** in the price-row level. Integrations that only parse product-level `ruleResults` will silently miss these adjustments and produce incorrect price breakdowns.

**Rule:** Always parse both levels when constructing a price breakdown. See [[Eligibility and Pricing Response]] for the full formula.

---

## `$.data.id` vs `$.data.peRequestId` naming

In the pricing-scenario response, the pricing engine request ID is at `$.data.id`. In the reprice-pricing response, it is at `$.data.peRequestId`. Same concept, different key names. The guides explicitly call this out, but the Swagger spec doesn't flag it.

---

## Required-but-nullable fields in Loan Service

Many fields in the Loan Service create/update schema are marked `required` in the spec but are also nullable. If your LOS doesn't have data for those fields, send `null`. This is documented as a known issue to be resolved in a future release.

---

## Loan Service vs Pricing Engine for `losLoanId`

The `losLoanId` is the loan identifier used across all loan-scoped API calls. It is set by the integration partner when creating a loan. Two IDs are submitted at creation:
- `loanNumber` — a display-friendly ID shown in Polly's UI
- `losLoanId` — the operational ID used in all API paths (appears in Polly UI URLs)

If `losLoanId` is a GUID, it is common to use a more user-friendly value for `loanNumber`. The `id` returned in the CreateLoan response is Polly's internal ID, not the `losLoanId`, and is not required for any subsequent calls.

---

## iFrame portal token is single-use

The `portalLoginToken` from `POST /pe/portal-authentication` expires in 5 minutes and is single-use. Attempting to reuse it returns an HTTP 500. This is a sharp edge when building session restoration logic.

Additionally: the `username` sent to this endpoint must be the **Polly portal username**, not the API user's username. They are often the same value but not guaranteed to be. Use the `/pe/users` endpoint to look up the correct username.

---

## Webhook OAuth failures are opaque

When a webhook is secured with OAuth and delivery fails due to an OAuth error, the `webhook-notifications` API shows status `OAUTH2_FAILURE` but does not return the underlying HTTP response code. Debugging these failures requires Polly support to look into internal logs.

**Implication:** If OAuth webhook security is needed, ensure your OAuth server is well-monitored and your token endpoint is reliable. HMAC is simpler to self-diagnose.

---

## Webhook delivery order is not guaranteed

Polly fires webhooks in order internally, but delivery order to your endpoint is not guaranteed. Design your webhook handler to be idempotent and to handle out-of-order delivery. For example, `lock.initialLockRequestSubmitted` may arrive after `lock.initialLockRequestApproved`.

---

## Rate, price, and amount fields are strings, not numbers

A significant share of financial fields in the API are typed as `string` in the schema, not `number` or `integer`. This is consistent across the Loan Service and most pricing response schemas. Examples:

- `CreateLoanRequest`: `amount`, `ltv`, `cltv`, `hcltv`, `rate`, `cashOutAmount`, `propertyValue`, `purchasePrice`, `lenderFee` — all `string`
- `FloatRequest`: `rate` — `string`
- `BuySide` / `SellSide` (lock request): `rate`, `basePrice`, `netPrice`, `workflowFee` — all `string`
- `LockExtensionRequest`: `extensionFeePoints`, `extensionFeePrice` — `number` (exception to the pattern)

**Rule:** Don't assume financial fields are numeric. Parse them as strings and convert on your side. Sending a numeric JSON value where the API expects a string will produce a 422.

---

## Two `lock-policies` endpoints with conflicting enum conventions

Two endpoints both retrieve lock policies for a loan but use different `lockAction` filter values:

| Endpoint | `lockAction` enum values |
|---|---|
| `GET /pe/loans/{loanId}/lock-policies/` | `Cancel`, `Extension`, `FloatDown`, `FloatRequest`, `Lock`, `PriceException`, `ProductChange`, `Relock`, `Reprice`, `Reset` |
| `GET /pe/loans/{loanId}/policies/` | `lockCancellation`, `lockExtension`, `priceException`, `relock`, `renegotiation`, `reprice` |

The first uses PascalCase with individual words. The second uses camelCase compound words. They are not interchangeable. The `renegotiation` value only appears in the second endpoint. There is no guide that documents this difference.

---

## `requestAndApprove` admin override is undocumented

Many lock-action request bodies include a `requestAndApprove` boolean field that allows admin API users to auto-approve the request during submission, bypassing the normal approval policy. Affected endpoints:

- `POST /pe/rate-lock/` (initial lock)
- `POST /pe/loans/{loanId}/reprice/`
- `POST /pe/loans/{loanId}/relock/`
- `POST /pe/loans/{loanId}/product-change/`
- `POST /pe/loans/{loanId}/price-exception/`
- `POST /pe/loans/{loanId}/lock-extension/`
- `POST /pe/loans/{losLoanId}/lock-cancellation/`
- `POST /pe/loans/{losLoanId}/lock-reset/`

No developer hub guide documents this field. It is present in the spec with the description "Optional parameter which can be used by admin users to auto approve request." Standard integrations should not use it unless explicitly authorized.

---

## `allowExpiredResult` admin override is undocumented

`POST /pe/rate-lock/` and `POST /pe/loans/{loanId}/product-change/` include an `allowExpiredResult` field: "Optional parameter which can be used by admin users to allow locking on expired rates." Also not documented in any guide.

---

## `type` field in price exception request must be lowercase

`PriceExceptionRequest.type` accepts `branch` or `corporate` (lowercase). However, `PriceExceptionReason.type` returns `Branch` or `Corporate` (capitalized). Do not pass the reason type directly from the reasons response into the exception request without lowercasing it first.

---

## Lock request `action` enum is wider than documented

The `LockRequest.action` field (returned by the lock-requests retrieve endpoints) supports these values:
`LOCK`, `REPRICE`, `EXTENSION`, `RELOCK`, `CANCEL`, `FLOAT_DOWN`, `PRODUCT_CHANGE`, `PRICE_EXCEPTION`, `RESET`

No guide documents all of these. Build your lock request handler to handle unknown action values gracefully for forward compatibility.

---

## Readme.io drops fields with title but no description

Polly's developer hub (readme.io) only renders fields that have a `description` value in the OpenAPI spec. Fields with only a `title` appear in the raw spec but are invisible on docs.polly.io. This affects approximately 700–1000 fields across the spec. When a field appears in the actual API response but is missing from the docs, check the raw spec — it likely has a title but no description.
