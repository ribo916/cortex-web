---
title: Webhook Security
type: concept
tags: [webhooks, security, hmac, oauth, signature]
created: 2026-05-02
updated: 2026-05-02
sources: [configuring-webhook-security.md, webhook-retries.md]
related: [wiki/concepts/webhooks.md, wiki/concepts/api-contract-quirks.md]
---

# Webhook Security

By default, webhook deliveries from Polly are **not secured**. Security must be explicitly configured. Polly supports two mechanisms: HMAC payload signing and OAuth 2.0 bearer token authentication.

---

## Scope

Security is configured per **API user + organization**. Once configured, it applies to all webhook subscriptions created by that API user in that organization. Security and subscriptions are managed independently — deleting one does not affect the other.

---

## HMAC

HMAC signs each webhook payload with a shared secret. The receiver verifies the signature to confirm payload integrity and sender authenticity. Simpler to self-diagnose than OAuth.

**Characteristics:**
- Algorithms: HMAC-SHA256 or HMAC-SHA512
- Signature header: `x-polly-signature`
- Encoding: Base64
- Secret: minimum 30 characters
- Computed over the **raw HTTP request body** (UTF-8 bytes)
- New signature generated for every delivery

**Verification requirements:**
- Use the exact raw request body as received — do not reformat, pretty-print, or re-serialize
- Compute HMAC over raw UTF-8 bytes
- Base64-encode the digest before comparison
- Compare to `x-polly-signature`

Any modification to the payload (whitespace, key order) causes a mismatch.

**Manage via:** Configuration: HMAC Security APIs (1 configuration max per API user).

---

## OAuth 2.0

OAuth authenticates each webhook request using a bearer token obtained via OAuth 2.0. Polly fetches a token from your token endpoint and includes it with each delivery.

**Characteristics:**
- Grant type: `client_credentials`
- Flow: machine-to-machine
- Token passed as `Authorization: Bearer {access_token}`

**Important caveats:**
- OAuth failures show as `OAUTH2_FAILURE` in the webhook notifications API without the response code — requires Polly support to investigate (see [[API Contract Quirks]])
- OAuth adds support complexity; consider whether it's necessary given that webhook payloads contain no PII and are workflow triggers only
- Alternatives to OAuth: HMAC signature verification, IP whitelisting, or endpoint-level auth

**Manage via:** Configuration: OAuth Security APIs (1 configuration max per API user).

---

## Retry policy

Polly retries on these HTTP response codes (up to 5 attempts, exponential backoff):

| Code | Meaning |
|---|---|
| 429 | Too Many Requests |
| 502 | Bad Gateway |
| 504 | Gateway Timeout |

**Subscription disabled (permanent failure):**
- Any 3xx redirect
- 410 Gone
- OAuth-specific: any 300–400 range, 401, 410, or invalid `client_id`

All other non-2xx responses are treated as failures and are **not retried**.

> **Polly has no mechanism to resend failed webhooks.** This is a hard constraint — design your receiver accordingly. Receipt acknowledgment should be immediate (2xx first, process async after).

---

## Recommendation

For most integrations, **HMAC is the better choice**:
- Easier to test and self-diagnose
- No token endpoint to maintain
- Failures show the actual HTTP response code in the notifications API
- Webhook payloads contain no PII, so OAuth's added authentication layer provides limited additional value

Use OAuth only if your security requirements specifically mandate bearer token authentication on the listener side.
