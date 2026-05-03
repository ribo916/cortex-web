---
title: "Source: Parsing the Pricing Scenario Response"
type: source
tags: [pricing, response, parsing, adjustments, clamps]
created: 2026-05-02
updated: 2026-05-02
sources: [parsing-the-pricing-scenario-response.md]
related: [wiki/concepts/eligibility-and-pricing-response.md, wiki/concepts/pricing-scenario.md]
---

# Source: Parsing the Pricing Scenario Response

**File:** `raw/devhub-guides/parsing-the-pricing-scenario-response.md`

## Summary

Developer guide for parsing the pricing scenario API response. Explains how base prices, visible adjustments, and clamp adjustments combine into the final price. Also covers FAQ on eligibility states, ineligible product analysis, and clamp mechanics.

## Key claims

- Price formula: `FinalPrice = BasePrice + VisibleAdjustments - ClampAdjustments`
- LLPA rules dependent on rate/investor appear ONLY in `prices[x].ruleResults[]`, not product-level — easy to miss
- `prices[].price` vs `prices[].netPrice`: netPrice adds rounding + broker comp
- Up to 8 possible clamps (4 price, 4 rate); categories: Adjustment, Margin, SRP, Total Price
- `TotalPrice` in clampResults is an aggregate summary — do not double-count it
- Eligible: isEligible=true, isValidResult=true, prices[] non-empty

## What this updates in the wiki

- Primary source for [[Eligibility and Pricing Response]]
