---
title: "Source: MI Quotes"
type: source
tags: [mi, mortgage-insurance, quotes, rate-cards]
created: 2026-05-02
updated: 2026-05-02
sources: [mi-quotes-1.md]
related: [wiki/concepts/mi-quotes.md]
---

# Source: MI Quotes

**File:** `raw/devhub-guides/mi-quotes-1.md`

**Last notable update:** 2026-02-27 — guide reformatted for clarity; no functionality changes

## Summary

Covers two MI paths: Direct Quoting (real-time from MI providers) and Rate Cards (static, embedded in pricing response). Includes both UI/iFrame and API-only workflows for Direct Quoting.

## Key claims

- Direct Quoting and Rate Cards are mutually exclusive per customer org configuration
- Rate Card data is in `$.data.results[x].mortgageInsuranceResult` in pricing scenario response
- Direct Quoting requires a separate API call; data is NOT in the pricing scenario response
- `mi.quoteSelectedViaUI` fires when user clicks "float" or "lock" after selecting a quote; not available in Scenario Mode without a loan application

## What this updates in the wiki

- Primary source for [[MI Quotes]]
