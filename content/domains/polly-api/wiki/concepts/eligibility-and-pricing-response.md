---
title: Eligibility and Pricing Response
type: concept
tags: [eligibility, pricing, response, parsing, adjustments, clamps, ruleresults]
created: 2026-05-02
updated: 2026-05-02
sources: [parsing-the-pricing-scenario-response.md, determining-eligibility-failures-from-a-pricing-response.md]
related: [wiki/concepts/pricing-scenario.md, wiki/concepts/lock-management-overview.md, wiki/concepts/api-contract-quirks.md]
---

# Eligibility and Pricing Response

A reference for parsing the Polly pricing scenario response. Covers product eligibility states, price calculation, adjustment types, clamps, and the enumeration integer mappings used in rule results.

---

## Product eligibility states

Check these three fields in each `$.data.results[x]` entry:

| State | `isEligible` | `isValidResult` | `prices[]` | Action |
|---|---|---|---|---|
| Eligible | `true` | `true` | non-empty | Display to user |
| Ineligible | `false` | `true` | empty | Parse ruleResults for failure reason |
| Invalid | any | `false` | empty | Check `invalidResultReason` |

---

## Eligibility rule types

Ineligibility rules appear in `$.data.results[x].ruleResults[]`:

- `category = "Eligibility"` — single static rule; the rule's description explains the failure
- `category = "EligibilityMatrix"` — matrix rule; `ruleId` starts with `EM-`. If all matrix rows fail, call the dedicated ineligible product detail endpoints for row-level explanation.

The boolean engine: if `booleanEquationValue == true`, the rule fired (scenario met the criteria). Products are ineligible when any eligibility rule fires `false` for the scenario.

---

## Price calculation — step by step

### Step 1: Calculate Base Price

Start with `priceAfterBaseAdjustments` (contains hidden global adjustments but not hidden price-level adjustments).

Then add hidden price-level adjustments from `results[x].prices[y].ruleResults[]` where ALL of:
- `isHiddenAdjustment == true`
- `target == "Price"`
- `category` in `["Adjustment", "SRP", "Margin"]`
- `booleanEquationValue == true`

### Step 2: Calculate Visible Adjustments

Parse **both** `results[x].ruleResults[]` AND `results[x].prices[y].ruleResults[]`.

Sum `resultEquation` where ALL of:
- `isHiddenAdjustment == false`
- `booleanEquationValue == true`
- `target == "Price"`
- `category` in `["Adjustments", "SRP", "Margin"]`

> **Critical:** LLPA rules dependent on rate or investor appear ONLY in price-row `ruleResults`, not product-level. Parsing only product-level will miss these. See [[API Contract Quirks]].

### Step 3: Calculate Clamp Adjustments

Loop through `prices[y].clampResults[]`. Sum `(unclamped - clamped)` where:
- `target == "Price"`
- `category` in `["Adjustments", "SRP", "Margin"]`

Ignore entries where `category == "TotalPrice"` — this is an aggregate summary, not a separate clamp.

**Clamp example:** Customer max margin = 3.00. Total margin from rules = 4.50. Clamp shows `unclamped: -4.5, clamped: -3.0`. The delta (1.5) is applied as an adjustment, shown in UI as "Max Margin Adj."

Up to 8 possible clamps (4 for price, 4 for rate), across categories: Adjustment, Margin, SRP, TotalPrice.

### Step 4: Final price

```
FinalPrice = BasePrice + VisibleAdjustments - ClampAdjustments
```

This equals `prices[y].price`.

`netPrice` = `price` + rounding rules + broker comp adjustments.

---

## Enumeration integer mappings

The pricing engine converts string enumerations to integers for rule evaluation. Below are the key mappings. Full table is in `raw/devhub-guides/determining-eligibility-failures-from-a-pricing-response.md`.

**Loan.Purpose**

| Int | Value |
|---|---|
| 1 | Purchase |
| 2 | Refinance |
| 6 | NoCashOutRefinance |
| 7 | CashOutRefinance |

**Property.Occupancy**

| Int | Value |
|---|---|
| 1 | PrimaryResidence |
| 2 | SecondHome |
| 3 | InvestmentProperty |

**Loan.Type**

| Int | Value |
|---|---|
| 1 | Conventional |
| 2 | FHA |
| 3 | VA |
| 4 | USDA |
| 5 | Jumbo |
| 8 | NonQM |
| 9 | HELOC |

**Borrower.VerificationMethod** *(updated April 22, 2026 — 3 new enumerations added)*

| Int | Value |
|---|---|
| 1 | FullDocument |
| 2 | BankStatement |
| 3 | VOE |
| 4 | AssetQualification |
| 5 | DSCR |
| 6 | Method1099 |
| 7 | CPAPAndL |
| 8 | CPAPAndLPlusBankStatement |
| 9 | AssetDepletion |
| 10 | AssetUtilization |

**Loan.AmortizationType**

| Int | Value |
|---|---|
| 1 | FIXED |
| 2 | ARM |
| 3 | BALLOON |
| 4 | OPTIONARM |

**Property.PropertyType** (selected)

| Int | Value |
|---|---|
| 1 | SFR |
| 2 | Condominium |
| 3 | PUD |
| 8 | Townhome |
| 9 | Multifamily |

See source file for full PropertyType, CreditGrade, PrepaymentPenaltyStructure, AUS, Citizenship, and StreamlineRefinanceType tables.
