---
title: Integration Patterns
type: concept
tags: [integration, los, pos, crm, iframe, api-only, hybrid, architecture]
created: 2026-05-02
updated: 2026-05-02
sources: [concepts-and-considerations.md, understanding-pollys-apis.md, iframing-polly-pricer-ui.md, polly-loan-service-overview.md, lock-management-apis-only-approach.md, lock-management-hybrid-approach.md]
related: [wiki/overview.md, wiki/entities/polly-loan-service.md, wiki/entities/native-los-integrations.md, wiki/concepts/iframe-pricer-ui.md, wiki/concepts/lock-management-overview.md, wiki/concepts/webhooks.md, wiki/concepts/custom-parameters.md]
---

# Integration Patterns

Polly's API surface covers a wide range of use cases. The right subset of APIs — and the right architecture — depends heavily on what kind of system is integrating and what workflows it needs to support. This is the single most important design question to answer before building.

---

## Decision tree

```
Does your system manage loans from origination through closing?
├── YES → LOS integration
│   ├── Does Polly have a native integration with your LOS?
│   │   (Encompass, MeridianLink, Byte, Mortgage Director)
│   │   ├── YES → Skip Loan Service. Polly reads/writes directly.
│   │   └── NO  → You need the Polly Loan Service (snapshot layer)
│   └── Do you need locking?
│       ├── NO  → Pricing + eligibility only (simpler)
│       └── YES → Choose: iFrame, API-only, or Hybrid (see below)
│
└── NO → Non-LOS integration
    ├── POS (Point of Sale)
    ├── CRM / Marketing
    ├── Lead Generation
    └── Customer-facing pricing display
```

---

## LOS integrations

### With native Polly LOS connection
**Applies to:** Encompass, MeridianLink, Byte, Mortgage Director

Polly has direct bi-directional connectivity to these systems. Polly reads loan data and writes updates back to the LOS. The Loan Management APIs (`/api/v2/loans/`) do **not** apply here and cannot be used to pull data from the native LOS.

Typical scope:
- iFrame or API for pricing and locking
- Webhooks for lock events, changeset publishes
- No Loan Service management required

### Without native connection (Loan Service required)
**Applies to:** All other LOS systems

Polly cannot read from or write to the LOS directly. The integration partner is responsible for:
1. Creating and maintaining a loan snapshot in the Polly Loan Service before any pricing or locking action
2. Subscribing to webhooks for lock/reprice events
3. Pulling updated data from the pricing response after lock events
4. Reconciling that data back to the LOS

This is the most complex integration type. See [[Polly Loan Service]] for data integrity, sync strategy, and pitfalls.

**Key effort areas:**
- Data mapping between your LOS schema and Polly's loan schema (Polly will ask for a mapping document at certification)
- Single-borrower object design decision (Polly only has one borrower object; multi-borrower LOS scenarios require design choices)
- Strategy for handling data changes on a locked or pending-lock loan
- Real-time actions evaluation (see [[Real-Time Actions]])

#### Sub-decision: iFrame vs API-only vs Hybrid

Once you need locking, you choose how to present it to users.

**iFrame (recommended for locking)**
- Polly hosts the entire lock UX in an embedded iframe
- Polly handles: price exceptions, concurrent lock + exception, Float Down, lock desk approval, worst-case pricing logic, product change UI, all lock policy enforcement
- You receive: webhook notifications → call APIs to pull lock/pricing details → reconcile to LOS
- Lower development effort, faster time-to-market
- Tradeoff: less UI control; the iframe renders Polly's UI inside your product
- Requires webhook subscriptions and data reconciliation logic regardless

> Polly **strongly recommends** the iFrame for any integration that includes locking. The lock desk and policy workflows are complex and hard to fully scope from the API surface alone.

**API-only (headless)**
- You build the entire lock UX in your own interface
- Your team implements: rate selection, lock submission, reprice, relock, product change, price exception, float down
- Complete UI consistency — the user never sees Polly's UI
- Significantly higher development effort and ongoing maintenance
- Every policy variant (auto-approve on/off, worst-case pricing windows, product change mappings) must be handled in your UI
- Suitable when UI consistency is a hard requirement and the team has bandwidth for the complexity

**Hybrid**
- Use the iFrame for the lock workflow, APIs for everything else (loan creation, data updates, status display)
- Common pattern for LOS integrations that want Polly's lock UX but own the rest of the experience
- Still requires webhook subscriptions to know when lock events complete

See [[iFrame Pricer UI]] for launch parameters, user/channel configuration, and troubleshooting.

---

## POS (Point of Sale) integrations

POS systems typically focus on pricing and eligibility during the loan application phase, often before the loan moves to the LOS.

**Common patterns:**

*Pricing display only (no locking):*
- Call the pricing scenario API directly with borrower/loan/property data
- Display eligible products and rates to the loan officer or borrower
- No Loan Service needed; no lock management
- Simplest integration surface

*Pricing + lock, customer also uses Encompass:*
- Polly has a native Encompass connection; once the loan is in Encompass, Polly can read from it
- The POS may not need the Loan Service for pricing if it can hand off to Encompass before lock
- Depends heavily on where in the workflow pricing and locking occur

*Pricing + lock, no native LOS:*
- Same complexity as a non-native LOS integration
- Loan Service required if you need locking

**Key question for POS:** Does the loan officer price and lock inside the POS, or does the POS hand off to an LOS before locking? The answer determines whether you need Loan Service and lock management.

---

## CRM / Marketing integrations

**Goal:** Show rates, generate quotes, run pricing scenarios for marketing or prospect nurturing. No locking.

**Relevant APIs:**
- `POST /api/v2/pe/pricing-scenarios/` — run scenarios without a loan ID
- iFrame in Scenario Mode — launch the Pricer UI without a loan ID for interactive rate shopping
- Quote Generation — generate shareable rate quotes from Scenario Mode (see [[Quote Generation]])
- Rate Alerts — set up monitoring for when a desired rate/price becomes available

**No Loan Service needed.** No lock management needed.

The main consideration is **channel selection**: pricing is channel-scoped (a channel = a product offering / rate sheet configuration). Retrieve available channels and the user's channel access to determine valid defaults when launching the iFrame.

---

## Lead generation

Similar to CRM/Marketing. Typically batch or real-time pricing to show rate ranges to prospects.

**Relevant APIs:**
- Pricing scenario API
- Batch pricing (if processing large volumes — see [[Batch Pricing]])

Batch pricing is especially relevant here: submit hundreds of scenarios via SFTP + API, receive output CSV with all pricing results.

---

## Webhook strategy by integration type

| Integration | Must subscribe | Useful to subscribe |
|---|---|---|
| LOS (locking) | `lock.*` events, `changeset.newVersionPublished*` | `customParameter.*`, `loan.actionRequired` (if Real-Time Actions enabled) |
| POS (pricing only) | `changeset.newVersionPublished*` | — |
| CRM/Marketing | — | `rateAlert.rateAlertSatisfied`, `changeset.newVersionPublished*` |
| Batch pricing | `batch.batchCompleted` | — |

---

## Common mistakes by integration type

**LOS (non-native):**
- Updating Loan Service data while a lock is pending or active without a strategy for the consequences
- Pulling custom parameters from Loan Service APIs instead of the Pricing Engine (wrong descriptions, wrong enumerations)
- Using `$.data.id` as the `peRequestId` for reprice calls (correct for pricing-scenario; wrong for reprice-pricing — use `$.data.peRequestId` there)
- Reconciling from a Retrieve Loan call instead of the pricing response

**POS:**
- Assuming the Loan Service is required when the customer's LOS has a native Polly connection
- Over-building lock management when the iFrame can handle it

**CRM/Marketing:**
- Not accounting for MI Rate Cards — some customers return MI data in the pricing scenario response directly; don't assume MI always requires a separate MI Quotes call

See [[API Contract Quirks]] for a full catalog of known API inconsistencies to watch for.
