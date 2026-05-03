---
title: "Source: Generate Pricing Quotes"
type: source
tags: [quotes, scenario-mode, iframe]
created: 2026-05-02
updated: 2026-05-02
sources: [generate-quotes.md]
related: [wiki/concepts/quote-generation.md, wiki/concepts/iframe-pricer-ui.md]
---

# Source: Generate Pricing Quotes

**File:** `raw/devhub-guides/generate-quotes.md`

## Summary

Guide for the Quote Generation feature in Scenario Mode. Covers the optional pre-generation of a quote scenario, iFrame Scenario Mode launch, webhook receipt on quote generation, and the two-step retrieval of rate quotes + detailed pricing.

## Key claims

- Org must be configured for quote generation by Polly; includes max-quotes-per-session setting
- Requires active subscription to `quote.rateQuotesGenerated`
- `rateQuotes[].productId` added in Release 116 — use as `productCodeOrId` path param (guaranteed no spaces)
- `rateQuotes[].miRequestId` also added in Release 116 — for retrieving associated MI quote
- `quoteScenarioId` in rate-quote response is blank if iFrame wasn't launched with a specific scenario

## What this updates in the wiki

- Primary source for [[Quote Generation]]
