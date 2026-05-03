---
title: "Source: Webhook Overview"
type: source
tags: [webhooks, overview, subscription]
created: 2026-05-02
updated: 2026-05-02
sources: [webhook-overview.md]
related: [wiki/concepts/webhooks.md, wiki/concepts/webhook-security.md]
---

# Source: Webhook Overview

**File:** `raw/devhub-guides/webhook-overview.md`

## Summary

High-level overview of Polly's webhook API suite. Covers subscription management, security configuration, notification lookup, and key developer considerations. Polly does not have a mechanism to resend failed events; IP whitelisting available on request.

## Key claims

- All webhook management (subscriptions, security, notification lookup) is self-managed by integration partners — no Polly involvement needed
- Webhooks only fire after write-back occurs; if notification not showing for a subscribed event, could be a write-back failure
- Policy-driven: auto-approval timing varies per org configuration
- Cross-workflow: concurrent lock + price exception → submitted events fire immediately; decision events held until both are decisioned
- `Polly does not have a way to resend failed webhooks`

## What this updates in the wiki

- Key inputs to [[Webhooks]]
