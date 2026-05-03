---
title: "Source: Determining Eligibility Failures"
type: source
tags: [eligibility, enumerations, ineligible, pricing-response]
created: 2026-05-02
updated: 2026-05-02
sources: [determining-eligibility-failures-from-a-pricing-response.md]
related: [wiki/concepts/eligibility-and-pricing-response.md, wiki/concepts/pricing-scenario.md]
---

# Source: Determining Eligibility Failures

**File:** `raw/devhub-guides/determining-eligibility-failures-from-a-pricing-response.md`

**Last notable update:** April 22, 2026 — 3 new enumerations added to `Borrower.VerificationMethod`

## Summary

Reference for parsing eligibility failure reasons from the pricing response and the full enumeration integer mapping tables used by the pricing engine. Covers how boolean logic evaluates eligibility rules and why string values are converted to integers internally.

## Key claims

- Require `returnTerseResponse: false` and `returnIneligibleProducts: true` to see failure reasons
- Pricing engine converts string enumerations to integers for performance
- New `Borrower.VerificationMethod` values (April 2026): AssetDepletion (9), AssetUtilization (10) — plus one more

## Enumeration tables

Full tables for: Loan.Purpose, Loan.RefinancePurpose, Property.Occupancy, Property.PropertyType, Loan.Impounds, Loan.Type, Loan.Position, Borrower.EmploymentDocumentationMethod, Borrower.VerificationMethod, Borrower.Citizenship, Loan.TemporaryBuydown, Loan.PropertyAttachment, Loan.AUS, Loan.StreamlineRefinanceType, Loan.PrepaymentPenaltyStructureType, Loan.Prepayment.Penalty.Structure, Borrower.CreditGrade, Loan.AmortizationType, Loan.CalculatedLoanLimitClassification

See raw file for the complete integer-to-enumeration mappings.

## What this updates in the wiki

- Selected key tables included in [[Eligibility and Pricing Response]]; full tables remain in raw source
