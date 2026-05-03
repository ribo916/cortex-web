---
title: "Source: Setting Up Postman"
type: source
tags: [postman, tooling, setup, openapi]
created: 2026-05-02
updated: 2026-05-02
sources: [setting-up-postman.md]
related: [wiki/concepts/authentication.md, wiki/entities/polly-ppe.md]
---

# Source: Setting Up Postman

**File:** `raw/devhub-guides/setting-up-postman.md`

## Summary

Step-by-step guide for importing Polly's OpenAPI 3.0 spec into Postman and configuring authentication. Covers import settings, environment variables, manual auth endpoint import, post-response script for token storage, and collection-level auth setup.

## Key claims

- OpenAPI spec URL: `https://docs.polly.io/openapi/polly-api-1.json`
- Import settings: Folder Organization = Tags; Optional Parameters = OFF; Always Inherit Authentication = ON
- Auth endpoint not in spec — import manually via cURL
- Post-response script: `pm.environment.set("accessToken", jsonData.access_token)`
- Delete the `baseUrl` collection variable and use environment variables instead

## What this updates in the wiki

- "Postman setup" section in [[Authentication]]
