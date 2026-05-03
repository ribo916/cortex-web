---
title: Native LOS Integrations
type: entity
tags: [los, encompass, meridianlink, byte, mortgage-director, native]
created: 2026-05-02
updated: 2026-05-02
sources: [concepts-and-considerations.md, polly-loan-service-overview.md]
related: [wiki/entities/polly-loan-service.md, wiki/concepts/integration-patterns.md, wiki/entities/polly-ppe.md]
---

# Native LOS Integrations

Polly has built direct, bi-directional integrations with four Loan Origination Systems:

- **Encompass** (ICE Mortgage Technology)
- **MeridianLink**
- **Byte**
- **Mortgage Director**

---

## What "native" means

With these systems, Polly can:
- Read loan data directly from the LOS
- Write updates back to the LOS after pricing/lock events
- Maintain data mapping between the LOS schema and Polly's schema

The integration partner does **not** need to manage the [[Polly Loan Service]] for these integrations. The Loan Management APIs (`/api/v2/loans/`) cannot be used to read data from or write data to a native LOS — they exist only for Loan Service integrations.

---

## Implications for integration design

Any integration where the customer's LOS is one of these four systems:
- Skip Loan Service setup
- Data synchronization is Polly's responsibility, not the integration partner's
- Focus is on pricing, locking, and webhooks
- Polly owns the data mapping to and from the LOS schema

**POS / CRM on shared customer using Encompass:** If a non-LOS system (e.g., a POS) is integrating for a customer whose LOS is Encompass, it may be able to leverage Polly's native Encompass connection rather than maintaining its own Loan Service snapshot. The specific workflow depends on where in the origination lifecycle pricing and locking occur.

---

## Encompass TPO note

The Polly Pricer iFrame has specific handling for Encompass TPO (Third-Party Originator) users. When launching the iFrame for TPO users, two additional parameters are required:
- `companyName` — the TPO company name
- `tpoUserId` — the TPO user ID from the TPO integration

This redirects the session to the correct TPO Connect landing page.
