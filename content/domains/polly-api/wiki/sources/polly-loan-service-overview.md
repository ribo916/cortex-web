---
title: "Source: Polly Loan Service Overview"
type: source
tags: [loan-service, data-integrity, custom-parameters, sync]
created: 2026-05-02
updated: 2026-05-02
sources: [polly-loan-service-overview.md]
related: [wiki/entities/polly-loan-service.md, wiki/concepts/custom-parameters.md, wiki/concepts/real-time-actions.md, wiki/concepts/integration-patterns.md]
---

# Source: Polly Loan Service Overview

**File:** `raw/devhub-guides/polly-loan-service-overview.md`

## Summary

Deep guide on the Polly Loan Service for non-native LOS integrations. Covers the service concept, API overview, custom parameter dual-API issue, data mapping considerations (especially single borrower), data synchronization, Real-Time Actions, and a full developer considerations checklist.

## Key claims

- Loan Service is a snapshot repository, not a system of record; maintained by the integrating partner
- Two loan IDs: `loanNumber` (display) and `losLoanId` (operational — used in all API paths)
- The `id` in CreateLoan response is Polly's internal ID; not required for subsequent calls
- Custom parameters from `Configuration: Loan Management` have degraded descriptions and mismatched enumeration types vs Pricing Engine
- Single borrower object design decision required for multi-borrower LOS loans
- Real-Time Actions: org-level config; every Loan Service update on a locked loan triggers repricing — can add significant complexity if updates are frequent
- Data reconciliation must come from the pricing response, not a Retrieve Loan call
- At certification, Polly asks for a mapping document showing how LOS data maps to Polly's loan schema

## Notable gotchas

- Polly "writes back" to Loan Service after lock events, but reconciliation should still come from the pricing response
- If iFrame loads and user updates data in LOS during that session, it is not reflected in the iFrame (loaded with snapshot at launch time)
- Required-but-nullable fields in the spec; send null if you don't have the data

## What this updates in the wiki

- Primary source for [[Polly Loan Service]] entity and [[Custom Parameters]]
