---
title: "Source: Webhook Retries"
type: source
tags: [webhooks, retries, reliability]
created: 2026-05-02
updated: 2026-05-02
sources: [webhook-retries.md]
related: [wiki/concepts/webhook-security.md, wiki/concepts/webhooks.md]
---

# Source: Webhook Retries

**File:** `raw/devhub-guides/webhook-retries.md`

## Summary

Defines Polly's webhook retry policy. Retries on 429/502/504 (up to 5, exponential backoff). Subscriptions disabled on 3xx or 410. All other non-2xx failures are not retried. Best practice: acknowledge receipt immediately, process async.

## Key claims

- Retry codes: 429, 502, 504 only — up to 5 retries with exponential backoff
- Subscription disabled permanently: 3xx redirects, 410 Gone, certain OAuth failures
- All other non-2xx = failure, not retried
- Polly has no resend mechanism
- Best practice: return 2xx immediately, put payload in queue (SQS, RabbitMQ, etc.) for async processing
- OAuth failures: `OAUTH2_FAILURE` status in notifications API without response code; requires Polly support

## What this updates in the wiki

- Retry details in [[Webhook Security]]
