---
title: Quote Generation
type: concept
tags: [quotes, scenario-mode, iframe, generate-quotes]
created: 2026-05-02
updated: 2026-05-02
sources: [generate-quotes.md, iframing-polly-pricer-ui.md]
related: [wiki/concepts/iframe-pricer-ui.md, wiki/concepts/pricing-scenario.md, wiki/concepts/webhooks.md, wiki/concepts/mi-quotes.md]
---

# Quote Generation

Quote Generation allows users in Scenario Mode to select one or more rate/price combinations and generate a shareable quote without being associated with a specific loan. The flow is iFrame-driven, with webhooks and APIs for downstream retrieval.

---

## Prerequisites

- Organization must be configured for quote generation by Polly (org-level setting, includes max quotes per request)
- Webhook subscription for `quote.rateQuotesGenerated` must be active

---

## End-to-end flow

```
1. (Optional) POST /pe/quote-scenarios/  →  quoteScenarioId
2. Launch iFrame in Scenario Mode (with optional quoteScenarioId)
3. User runs pricing + clicks Generate Quotes
4. Webhook: quote.rateQuotesGenerated fires → resourceId = rateQuoteId
5. GET /pe/rate-quotes/{rateQuoteId}  →  rateQuotes[] + peRequestId
6. GET /pe/pricing-scenarios/{peRequestId}/products/{productId}/rates/{rate}
   →  detailed pricing data
```

---

## Step 1: Pre-generate a quote scenario (optional)

`POST /api/v2/pe/quote-scenarios/`

Returns a `quoteScenarioId` to preload the iFrame with specific loan data. Benefits: faster user experience, consistent parameters across sessions.

If skipped, the iFrame launches in blank Scenario Mode.

---

## Step 2: Launch iFrame in Scenario Mode

Launch without a `loanId`. Optionally pass `quoteScenarioId` to preload data.

Scenario Mode supports:
- Multiple pricing scenarios
- Interactive rate selection
- Up to N rate/price combinations (N configured by Polly per org)
- No loan association required

---

## Step 3: Webhook receipt

When the user clicks "Generate Quotes":
- UI shows confirmation toast
- `quote.rateQuotesGenerated` fires

**Webhook payload:**
```json
{
  "data": {
    "resource": "quote",
    "resourceId": "777",
    "losLoanId": "",
    "orgTicker": "ABC"
  }
}
```

`resourceId` is the `rateQuoteId` for the next call.

---

## Step 4: Retrieve rate quotes

`GET /api/v2/pe/rate-quotes/{rateQuoteId}`

```json
{
  "createdAt": "2026-03-18T21:58:10Z",
  "user": "jdoe",
  "quoteScenarioId": "400febde-...",
  "peRequestId": "333bbbe7...",
  "rateQuotes": [
    { "productCode": "AAABBB", "rate": 5.0, "productId": "...", "userId": 11111, "miRequestId": 10411 },
    { "productCode": "AAACCC", "rate": 5.5, "productId": "...", "userId": 11111, "miRequestId": 10412 }
  ]
}
```

Key fields:
- `peRequestId` — use in Step 5 (this is the pricing engine request ID)
- `productId` — use as `productCodeOrId` in Step 5 (guaranteed no spaces; safer than `productCode`)
- `miRequestId` — use with `GET /api/v2/mi-quotes/{miRequestId}/selection` if MI quote retrieval is needed
- `quoteScenarioId` — blank if iFrame wasn't launched with a specific scenario

---

## Step 5: Retrieve detailed pricing

`GET /api/v2/pe/pricing-scenarios/{peRequestId}/products/{productId}/rates/{rate}`

Use the product-level endpoint (not the full pricing response) — it's smaller, faster, and sufficient since you already know the product and rate from Step 4.

---

## Relation to Scenario Mode iFrame

Quote Generation is specifically the Scenario Mode workflow. See [[iFrame Pricer UI]] for all iFrame launch configurations — `quoteScenarioId` is one of several optional parameters for iFrame launch.
