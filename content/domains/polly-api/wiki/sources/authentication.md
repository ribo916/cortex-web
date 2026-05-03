---
title: "Source: Authentication"
type: source
tags: [authentication, oauth, token]
created: 2026-05-02
updated: 2026-05-02
sources: [authentication.md]
related: [wiki/concepts/authentication.md]
---

# Source: Authentication

**File:** `raw/devhub-guides/authentication.md`

## Summary

Step-by-step guide for obtaining and using OAuth 2.0 ROPC bearer tokens. Covers initial token request, authenticated request format, and token refresh. Includes cURL examples ready for Postman import.

## Key claims

- Endpoint: `POST /api/v2/auth/token/` with `Content-Type: application/x-www-form-urlencoded`
- Token lifetime: `expires_in: 3600` (1 hour)
- Refresh requires all original credentials (username, password, client_id, client_secret) plus grant_type=refresh_token — effectively a new auth step
- Auth endpoint is not in the Swagger/OpenAPI spec; must be added manually

## What this updates in the wiki

- Primary source for [[Authentication]] concept page
