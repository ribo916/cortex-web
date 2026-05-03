---
title: Authentication
type: concept
tags: [authentication, oauth, bearer-token, credentials]
created: 2026-05-02
updated: 2026-05-02
sources: [authentication.md, getting-started.md, setting-up-postman.md]
related: [wiki/entities/polly-ppe.md, wiki/concepts/iframe-pricer-ui.md]
---

# Authentication

Polly uses an **OAuth 2.0 Resource Owner Password Credentials (ROPC)** flow. The client exchanges user credentials directly for a short-lived access token. Every API call requires a valid bearer token in the `Authorization` header.

---

## Getting a token

**Endpoint:** `POST /api/v2/auth/token/`  
**Content-Type:** `application/x-www-form-urlencoded`

> This endpoint is **not in the OpenAPI spec**. Import manually (see [[API Contract Quirks]]).

**Required parameters:**

| Parameter | Value |
|---|---|
| `username` | API username |
| `password` | API password |
| `grant_type` | `password` |
| `client_id` | API client ID |
| `client_secret` | API client secret |

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "write read",
  "refresh_token": "dXNlcjo..."
}
```

Token lifetime: 3600 seconds (1 hour).

---

## Using the token

Add to every request:
```
Authorization: Bearer {access_token}
```

---

## Refreshing the token

Use the same endpoint with `grant_type=refresh_token` and include the `refresh_token` from the previous response. All other parameters (`username`, `password`, `client_id`, `client_secret`) are still required.

> Despite using the refresh token grant type, this effectively performs a new authentication step — it is not a silent refresh.

---

## Best practices

- Store credentials in environment variables or a vault; never hardcode
- Use `expires_in` to proactively refresh before expiry
- Handle 401 responses gracefully: refresh token and retry
- Credentials are environment-specific; do not reuse across environments

---

## iFrame authentication (portal token)

The iFrame launch requires a separate one-time-use **portal authentication token**, obtained from:

`POST /api/v2/pe/portal-authentication`

This is distinct from the API bearer token. See [[iFrame Pricer UI]] for the full launch flow.

---

## Postman setup

1. Import OpenAPI spec from `https://docs.polly.io/openapi/polly-api-1.json` (folder organization = Tags)
2. Manually import the auth cURL above
3. Add post-response script to store token: `pm.environment.set("accessToken", jsonData.access_token)`
4. Set collection root auth type to Bearer Token with value `{{accessToken}}`

See `raw/devhub-guides/setting-up-postman.md` for step-by-step Postman configuration.
