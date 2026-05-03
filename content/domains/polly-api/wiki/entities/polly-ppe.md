---
title: Polly — Product & Pricing Engine
type: entity
tags: [polly, ppe, product, api]
created: 2026-05-02
updated: 2026-05-02
sources: [getting-started.md, understanding-pollys-apis.md]
related: [wiki/overview.md, wiki/concepts/integration-patterns.md, wiki/entities/polly-loan-service.md, wiki/concepts/pricing-scenario.md, wiki/concepts/lock-management-overview.md]
---

# Polly — Product & Pricing Engine

Polly is a **Product and Pricing Engine (PPE)** for the mortgage industry. It evaluates loan scenarios against lender-configured product eligibility rules and pricing adjustments, returning rates, prices, and adjustment breakdowns for each eligible product.

---

## Core function

At its core, Polly answers: *"Given this borrower, loan, and property, which products are eligible, and at what rate and price?"*

It does this by running the submitted loan scenario against a customer-configured pricing version (changeset) that contains:
- Product definitions and eligibility rules
- LLPA (Loan-Level Price Adjustments) matrices
- Margin, SRP, fee, and concession rules
- Custom parameters defined by the lender
- Channel configurations

---

## Base URL

```
https://api.prod.polly.io
```

All API calls use this base. Authentication returns a bearer token used on every subsequent request.

---

## API surface (by capability)

| Area | API tag | Description |
|---|---|---|
| Authentication | — | OAuth 2.0 ROPC flow; token exchange |
| Pricing | `Pricing` | Submit scenarios, retrieve results |
| Lock Management | `Lock Management` | Lock, reprice, relock, product change, price exception |
| Loan Management | `Loan Management` | Polly Loan Service CRUD |
| Configuration: Pricing | `Configuration: Pricing` | Custom parameters, channels, changest info |
| Configuration: Loan Management | `Configuration: Loan Management` | Loan Service parameter management |
| Configuration: Webhooks | `Configuration: Webhooks` | Subscription management |
| Configuration: HMAC/OAuth Security | — | Webhook delivery security |
| Webhook Notifications | `Webhook Notifications` | Lookup sent webhook events |
| iFrame / Portal | `iFrame / Portal` | Portal authentication token for iFrame launch |
| MI Quotes | `MI Quotes` | Mortgage Insurance quote requests |
| Batch Pricing | `Batch Pricing` | Bulk pricing via SFTP + API |
| Quote Generation | `Quote Generation` | Scenario-mode quote creation |

---

## Versioning

Polly APIs are **not versioned**. Releases avoid breaking changes. New optional fields may be added to requests or responses. Integrations must ignore unknown properties to remain forward-compatible. Existing fields and behaviors are not removed or changed.

---

## Credentials

Credentials are provisioned per environment after contract signing, delivered via 1Password:
- `baseURL`
- `username` and `password` (for ROPC token exchange)
- `client_id` and `client_secret`

Credentials are environment-specific and must not be shared across environments.

---

## Staying current

- **Changelog:** `docs.polly.io/changelog` — updated each sprint, typically one week before release
- **RSS feed:** `docs.polly.io/changelog.rss`
- **New guides:** Marked with a "NEW" badge for 2 weeks after publication
- **Changeset webhooks:** `changeset.newVersionPublishedAutomatically` and `changeset.newVersionPublishedManually` — subscribe to these to detect pricing configuration changes in real time

---

## Related

- [[Polly Loan Service]] — snapshot repository for non-native LOS integrations
- [[Native LOS Integrations]] — Encompass, MeridianLink, Byte, Mortgage Director
- [[Integration Patterns]] — choosing the right API surface for your use case
