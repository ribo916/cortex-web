---
title: "Source: iFraming Polly Pricer UI"
type: source
tags: [iframe, pricer-ui, portal, launch]
created: 2026-05-02
updated: 2026-05-02
sources: [iframing-polly-pricer-ui.md]
related: [wiki/concepts/iframe-pricer-ui.md, wiki/concepts/authentication.md]
---

# Source: iFraming Polly Pricer UI

**File:** `raw/devhub-guides/iframing-polly-pricer-ui.md`

## Summary

Step-by-step guide for embedding Polly's Pricer UI via iFrame. Covers the 3-step launch flow, all URL parameters, launch modes, user/channel considerations, and troubleshooting.

## Key claims

- 3 steps: Bearer token → portalLoginToken → launch URL
- `portalLoginToken` is single-use, 5-minute expiry; reuse returns HTTP 500
- `username` in portal-authentication call is the Polly portal user, not the API user (may differ)
- `audienceId` sets default channel but doesn't restrict the user
- Legacy UI vs New UI: feature differences exist (e.g., Float Down only in New UI); no integration difference
- Encompass TPO users need `companyName` and `tpoUserId` params
- Third-party cookies must be enabled for the iFrame to function

## What this updates in the wiki

- Primary source for [[iFrame Pricer UI]]
