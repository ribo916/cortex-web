---
title: Custom Parameters
type: concept
tags: [custom-parameters, configuration, pricing-engine, loan-service, enumerations]
created: 2026-05-02
updated: 2026-05-02
sources: [concepts-and-considerations.md, polly-loan-service-overview.md]
related: [wiki/entities/polly-loan-service.md, wiki/concepts/pricing-scenario.md, wiki/concepts/iframe-pricer-ui.md, wiki/concepts/api-contract-quirks.md, wiki/concepts/integration-patterns.md]
---

# Custom Parameters

Custom parameters are lender-defined fields that extend Polly's standard loan schema. They drive eligibility rules, pricing adjustments, and other configuration-specific behaviors. Every customer's parameter set is different.

---

## What they are

Customers configure custom parameters in their Polly pricing configuration. Types: Enum, Boolean, Decimal, Integer, String.

Each parameter can have:
- A description (e.g., "This parameter specifies the Branch")
- A note
- Default visibility (can be hidden from all Loan Officers)
- Loan Officer–specific restrictions on which parameters or which enumeration values are accessible

**Example:** `Branch` as an Enum custom parameter, with each Loan Officer restricted to only the branch they work in.

---

## Two APIs, one concept — don't confuse them

Custom parameters appear in **both** the Pricing Engine and the Loan Service, but these are distinct API contexts with different behaviors:

### Pricing Engine (source of truth)

`GET /api/v2/pe/custom-parameters/` — returns parameters for the currently active pricing version, with the option to look at a specific changeset.

Returns:
- The real parameter **descriptions** as configured by the customer
- Enumeration types matching those used in the users access endpoint (e.g., `Boolean`)
- User-specific parameter access: `GET /api/v2/pe/users/{userId}/parameters`

**Use this API for:** any integration focused on eligibility, pricing, or locking.

### Loan Service (do not use for pricing logic)

`GET /api/v2/custom-parameters/` (Configuration: Loan Management section)

Returns parameters that were synced from the Pricing Engine at last publish, but with degraded data:
- Descriptions say `"Parameter added from pricing version"` — not the real description
- Enumeration types **don't match** the Pricing Engine (e.g., `BooleanType` instead of `Boolean`)

Allows CRUD operations on parameters, but:
- Changes here do **not affect pricing**
- Parameters added to Loan Service but not on a loan get soft-deleted when pricing is next published
- Modifying "pricing-derived" parameters in Loan Service creates data integrity issues

**Only use this API for:** Loan Service–specific parameter management, not as a source of truth.

---

## When parameters are synchronized

When a pricing version is published:
1. Parameters are synced to the Loan Service
2. If subscribed, webhook events fire: `customParameter.addedCustomParameter`, `customParameter.updatedCustomParameter`, `customParameter.deletedCustomParameter`

Custom parameters are **stable** configuration items and rarely change after initial setup. Deleting parameters is discouraged.

---

## Sending parameters in API calls

In Loan Service integrations, custom parameters are sent in the `customValues` object of create/update loan calls as name/value pairs.

In direct pricing scenario calls (without Loan Service), custom parameters go in `customValues[]` at the top level of the pricing request.

---

## Critical consideration: missing parameters affect eligibility

If a required custom parameter is not supplied, the pricing engine may evaluate eligibility rules with a `null` value, which can cause unexpected ineligibility. Always sync the current parameter list from the Pricing Engine before building pricing payloads.

---

## Loan Officer access restrictions

The Loan Officer role has unique restrictions:
- Can be restricted from seeing specific custom parameters entirely
- Can be restricted to specific enumeration values within a parameter (e.g., only their branch)
- These restrictions apply in both the Polly Pricer UI and when retrieving user-accessible parameters via API

When launching the iFrame, the Loan Officer's parameter access determines what is visible and editable. Parameters they cannot access resolve to `null` from the Loan Service, even if a value is on the loan record.

Retrieve a user's parameter access: `GET /api/v2/pe/users/{userId}/parameters`
