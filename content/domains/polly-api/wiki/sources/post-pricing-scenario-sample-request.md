---
title: "Source: Sample Pricing Scenario Request"
type: source
tags: [pricing, sample, request, payload]
created: 2026-05-02
updated: 2026-05-02
sources: [post-pricing-scenario-sample-request.md]
related: [wiki/concepts/pricing-scenario.md]
---

# Source: Sample Pricing Scenario Request

**File:** `raw/devhub-guides/post-pricing-scenario-sample-request.md`

## Summary

Example request payload for `POST /api/v2/pricing-scenarios`, organized by section: search, borrower, loan, property, brokerCompPlan, customValues, settings. Represents a conventional purchase loan in Virginia.

## Key claims

- Replace `{{yourAudienceID}}` with the actual audience (channel) ID before use
- `settings.returnTerseResponse: true` for compact output; false for full eligibility detail
- `settings.returnIneligibleProducts: false` by default; set true to see ineligible products with failure reasons

## What this updates in the wiki

- Reference example in [[Pricing Scenario]]; no new concept pages needed
