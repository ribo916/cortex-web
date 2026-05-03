---
title: "Source: Configuring Webhook Security"
type: source
tags: [webhooks, security, hmac, oauth]
created: 2026-05-02
updated: 2026-05-02
sources: [configuring-webhook-security.md]
related: [wiki/concepts/webhook-security.md, wiki/concepts/webhooks.md]
---

# Source: Configuring Webhook Security

**File:** `raw/devhub-guides/configuring-webhook-security.md`

## Summary

Guide for configuring HMAC and OAuth 2.0 security for webhook delivery. Covers both mechanisms, their characteristics, configuration APIs, and lifecycle notes. Default: no security; must be explicitly configured.

## Key claims

- HMAC: signature in `x-polly-signature` header (Base64 Base64-encoded); computed over raw HTTP body as UTF-8 bytes; any reformatting causes mismatch
- OAuth: client_credentials grant; machine-to-machine; Polly fetches token and attaches as Bearer
- Security scoped per API user + organization; 1 HMAC and 1 OAuth config max per API user
- Security and subscriptions are independent — deleting one does not affect the other
- Hookdeck (free) can help validate HMAC signatures during testing

## What this updates in the wiki

- Primary source for [[Webhook Security]]
