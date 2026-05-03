---
title: Lock Desk
type: entity
tags: [lock-desk, approval, policy, lock-management]
created: 2026-05-02
updated: 2026-05-02
sources: [webhook-notification-payload.md, relock.md, reprice-pricing-workflow.md, product-change-workflow.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/webhooks.md, wiki/concepts/real-time-actions.md]
---

# Lock Desk

The Lock Desk is the team at a mortgage lender that reviews and approves or denies lock requests submitted by Loan Officers. In Polly, it is the human decision-making layer for lock workflows that are not configured for auto-approval.

---

## Role in lock workflows

Every lock action in Polly (initial lock, reprice, relock, product change, price exception, float down, lock cancellation) has a configurable approval policy. Customers configure these policies in Polly. Two outcomes are possible:

- **Auto-approved:** The action completes immediately without Lock Desk review. Webhook fires as approved.
- **Manual review:** The Lock Desk user reviews the request in the Polly UI and approves or denies it. Webhook fires when decisioned.

The same lock workflow that is auto-approved in one customer's org may require Lock Desk review in another. Integrations must handle both outcomes.

---

## What the Lock Desk can see and do

- Reviews pending lock requests in the Polly UI (not accessible via iFrame or API to Lock Desk users)
- Can perform sell-side analysis on pending requests
- Can manually update sell-side custom fields while a loan is in a resting state (no pending requests) — this triggers an auto-approved reprice and fires `lock.SellSideManuallyUpdated`
- Cannot be accessed via the iFrame by Loan Officers; the Lock Desk has its own Polly UI login

---

## Impact on integration design

Because lock desk review introduces variable latency between a lock submission and its approval, integrations must:
- Not assume immediate approval after a lock request
- Wait for the approval webhook before treating the lock as confirmed
- Handle denial webhooks and surface denial reasons to users

The Lock Desk is also relevant for the [[Lock Validation Workflow]] (pre-approval), where a third-party system intercepts a lock request before it even reaches the Lock Desk.

---

## Lock desk-only actions

Two actions can only be performed by the Lock Desk in the Polly UI (not via API or iFrame):
- **Sell Side Analysis** while a lock request is pending → fires `lock.pendingLockSellSideAnalysisExecuted`
- **Manual Sell Side Field Update** on a resting loan → fires `lock.SellSideManuallyUpdated`
