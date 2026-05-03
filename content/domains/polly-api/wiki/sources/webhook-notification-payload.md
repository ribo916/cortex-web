---
title: "Source: Webhook Notifications — CloudEvents 1.0"
type: source
tags: [webhooks, payload, events, catalog]
created: 2026-05-02
updated: 2026-05-02
sources: [webhook-notification-payload.md]
related: [wiki/concepts/webhooks.md]
---

# Source: Webhook Notifications — CloudEvents 1.0

**File:** `raw/devhub-guides/webhook-notification-payload.md`  
**Last event catalog update:** January 23, 2026

## Summary

Describes the CloudEvents 1.0 payload format used by all Polly webhooks, and provides the full event catalog as of January 2026. Each event is described with its trigger condition.

## Key claims

- All events use CloudEvents 1.0 spec; payload is consistent across event types
- `data.resourceId` is the key to retrieve full details via API
- Payloads contain no PII
- Full catalog includes: lock (25+), loan, changeset, customParameter, float, MI, quote, rateAlert, batch, rateSheets events
- For live list: `GET /api/v2/event-types/?isActive=true`

## What this updates in the wiki

- Full event catalog in [[Webhooks]]
