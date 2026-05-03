---
title: "Source: Getting Started"
type: source
tags: [onboarding, credentials, getting-started]
created: 2026-05-02
updated: 2026-05-02
sources: [getting-started.md]
related: [wiki/concepts/authentication.md, wiki/entities/polly-ppe.md]
---

# Source: Getting Started

**File:** `raw/devhub-guides/getting-started.md`  
**Type:** Onboarding guide

## Summary

Entry point for new integration partners. Covers the 4-step onboarding process: obtain credentials, configure dev tools, authenticate, and explore APIs. Notes that APIs are not versioned and integrations should ignore unknown properties.

## Key claims

- Credentials are delivered via 1Password after contract signing: `baseURL`, `username`, `password`, `client_id`, `client_secret`
- Authentication uses OAuth 2.0 Bearer Token (ROPC flow)
- Changelog updated each sprint, ~1 week before release; also available as RSS
- New guides show "NEW" badge for 2 weeks

## What this updates in the wiki

- Foundation for [[Authentication]] and [[Polly PPE]] entity
- No-versioning policy is noted in [[Polly PPE]]
