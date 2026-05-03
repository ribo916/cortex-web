---
title: Real-Time Actions (Pipeline Monitoring)
type: concept
tags: [real-time-actions, pipeline-monitoring, loan-service, reprice, auto-reprice]
created: 2026-05-02
updated: 2026-05-02
sources: [required-actions-aka-realtime-pipeline-monitoring.md, polly-loan-service-overview.md]
related: [wiki/entities/polly-loan-service.md, wiki/concepts/webhooks.md, wiki/concepts/lock-management-overview.md, wiki/concepts/integration-patterns.md]
---

# Real-Time Actions (Pipeline Monitoring)

Real-Time Actions is an **org-level configuration** in Polly (Loan Service integrations only). When enabled, every PUT or PATCH to the Polly Loan Service on an active loan triggers an automatic eligibility and pricing check, followed by a reprice if needed.

---

## What happens when enabled

**If the loan has a pending lock:**
- The pending lock is immediately cancelled
- `lock.autoRepriceLockAutoCancelled` fires

**If the loan is locked:**
Polly runs eligibility and pricing. Then, based on policy configuration:

| Pricing outcome | Auto-approve policy | What happens | Webhook |
|---|---|---|---|
| Price unchanged | Auto-approve ON (any reprice) | New lock ID created, confirmation doc generated | `lock.autoRepriceNoPricingChangeNoActionRequired` |
| Price unchanged | Auto-approve ON (only if price unchanged) | Same | `lock.autoRepriceNoPricingChangeNoActionRequired` |
| Price unchanged | Auto-approve OFF | Required action triggered (no auto-reprice) | `loan.actionRequired` |
| Price changed | Auto-approve ON (all reprices) | New lock ID created, confirmation doc generated | `lock.autoRepricePricingChangedNoActionRequired` |
| Price changed | Auto-approve ON (only if unchanged) | Required action triggered | `loan.actionRequired` |
| Price changed | Auto-approve OFF | Required action triggered | `loan.actionRequired` |

Fields that trigger a reprice when changed are **customer-configurable**.

---

## When to think carefully before enabling

Real-Time Actions is powerful but introduces complexity. Key risks:

- If your LOS sends update calls on every field change (common in some systems), enabling Real-Time Actions means every small data update triggers repricing on locked loans — generating constant lock IDs, confirmation documents, and webhook events
- Support issues become harder to triage because every Loan Service update potentially affects lock state
- If your integration updates loan data frequently as part of normal operation, evaluate whether Real-Time Actions is actually appropriate for your workflow

> If you plan on updating the loan frequently, your integration may not be ideally suited for Real-Time Actions.

---

## Webhook events

- `loan.actionRequired` — reprice required, human action needed
- `lock.autoRepriceLockAutoCancelled` — pending lock was cancelled by Real-Time Actions trigger
- `lock.autoRepriceNoPricingChangeNoActionRequired` — auto-reprice completed, no price change
- `lock.autoRepricePricingChangedNoActionRequired` — auto-reprice completed, price changed, auto-approved

---

## Applies to

Loan Service integrations only. Does not apply to native LOS integrations (Encompass, MeridianLink, Byte, Mortgage Director).
