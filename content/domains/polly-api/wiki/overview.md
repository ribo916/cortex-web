---
title: Polly API Wiki — Overview
type: overview
tags: [overview, ppe, integration]
created: 2026-05-02
updated: 2026-05-02
sources: [getting-started.md, understanding-pollys-apis.md, concepts-and-considerations.md]
related: [wiki/concepts/integration-patterns.md, wiki/entities/polly-ppe.md, wiki/entities/polly-loan-service.md, wiki/concepts/pricing-scenario.md, wiki/concepts/lock-management-overview.md, wiki/concepts/webhooks.md]
---

# Polly API Overview

Polly is a **Product and Pricing Engine (PPE)** that evaluates loan scenarios against lender-configured products, eligibility rules, and pricing adjustments. Its public API suite exposes the full pricing and lock management lifecycle — from an initial rate quote through lock, reprice, relock, and downstream integration.

This wiki covers the developer-facing API surface: what it does, how it works, and how to build on it.

---

## What Polly's APIs do

| Capability | Summary |
|---|---|
| **Pricing** | Submit borrower, loan, and property data; receive eligible products with rates, prices, and applied adjustments |
| **Lock Management** | Lock a rate; then reprice, relock, change product, request a price exception, or float down |
| **Loan Service** | Maintain a snapshot of loan data for integrations without a native Polly ↔ LOS connection |
| **Polly Pricer UI (iFrame)** | Embed Polly's full UI in your application; offloads complex lock UX to Polly |
| **Batch Pricing** | Submit hundreds of pricing scenarios via SFTP + API; receive output CSV |
| **MI Quotes** | Request real-time Mortgage Insurance quotes from configured providers |
| **Webhooks** | Receive event-driven notifications for locks, reprices, changeset publishes, etc. |
| **Quote Generation** | Generate shareable rate quotes from Scenario Mode (no loan ID required) |

---

## Integration archetypes

The right integration design depends on what kind of system is integrating. See [[Integration Patterns]] for the full breakdown. High-level map:

| Archetype | Loan Service needed? | Lock management? | Typical entry point |
|---|---|---|---|
| **LOS — native** (Encompass, MeridianLink, Byte, Mortgage Director) | No — Polly has direct read/write | Yes | iFrame or API |
| **LOS — non-native** | Yes — must maintain loan snapshot | Yes | iFrame + webhooks, or full API |
| **POS** | Depends — if customer uses a native LOS, Polly can read from it | Sometimes | Pricing API or iFrame |
| **CRM / Marketing / Lead Gen** | No | No | Pricing API or Scenario Mode iFrame |
| **Customer-direct** | No | No | Pricing API |

---

## Core architectural decisions

Every integration answers two questions:

**1. Do you need the Loan Service?**
Only if your LOS is not Encompass, MeridianLink, Byte, or Mortgage Director. If it is, Polly has a direct native connection and you skip the Loan Service entirely. Non-native LOS providers must create and maintain loan snapshots via the Loan Management APIs.

**2. iFrame or full API?**
The Polly Pricer UI (iFrame) handles complex lock workflows (price exceptions, concurrent lock + exception, Float Down, etc.) so you don't have to build them. Full API gives you complete UI control but requires implementing every lock workflow yourself. Most LOS integrations with locking should evaluate the iFrame first.

---

## Major themes across these guides

**Changeset = pricing version.** Polly's pricing configurations are versioned. A changeset publish can affect eligible products, rules, parameters, and rates. Webhooks fire on publish; integrations that depend on pricing configuration should subscribe.

**Policies are customer-configurable.** Auto-approval for locks, reprices, relocks, product changes, and price exceptions is all configured per-customer. A workflow that is auto-approved in one org may require lock desk review in another. Design for both.

**Webhooks fire after write-back.** Lock events only fire after Polly has written data back to the Loan Service. If you subscribe to a lock event but don't see it in webhook notifications, the write-back may have failed, not the event.

**Data reconciliation is the Loan Service integrator's responsibility.** After lock events, the LOS must pull updated pricing data and reconcile back to its own data store. The pricing response (not a Retrieve Loan call) is the authoritative source of what data was used.

---

## Source count

27 developer hub guides ingested (2026-05-02). Known gaps: API reference (endpoint schemas, full field-level docs) is not in this wiki — link to `docs.polly.io/reference` for that.

---

## Key open questions (as of first ingest)

- What does the full event catalog look like for the most common LOS integration pattern? (Covered partially in [[Webhooks]])
- What is the expected latency profile for the pricing scenario endpoint?
- Are there rate limits on the pricing scenario or lock endpoints?
- What does the certification process require from integration partners?
