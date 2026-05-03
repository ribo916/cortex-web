---
title: "Source: Concepts and Considerations"
type: source
tags: [concepts, loan-service, custom-parameters, iframe, webhooks, mi]
created: 2026-05-02
updated: 2026-05-02
sources: [concepts-and-considerations.md]
related: [wiki/concepts/integration-patterns.md, wiki/entities/polly-loan-service.md, wiki/concepts/custom-parameters.md, wiki/concepts/iframe-pricer-ui.md, wiki/concepts/webhooks.md, wiki/concepts/mi-quotes.md]
---

# Source: Concepts and Considerations

**File:** `raw/devhub-guides/concepts-and-considerations.md`

## Summary

Pre-integration design guide covering 6 concepts that affect architecture decisions: Loan Management (native vs Loan Service), Loan Service data integrity, User Management, Custom Parameters, iFrame vs full API, and MI Providers. Intended to surface gotchas before development starts.

## Key claims

- Loan Management APIs are for Loan Service integrations only — cannot pull data from Encompass or other native LOS systems
- Loan Officers are the only role with channel and custom parameter restrictions
- Polly does not provide webhooks for user creation events
- Custom parameters are versioned with pricing; missing parameters can affect eligibility
- Polly strongly recommends evaluating the iFrame for any integration that includes locking
- Some customers use MI Rate Cards — MI data comes back in the pricing scenario response, not via MI Quotes API

## Notable gotchas flagged

- Common misconception: Loan Management APIs work with Encompass (they don't)
- Partners have shipped MI integrations without knowing about Rate Card customers, causing confusion when a new Rate Card customer launches
- The iFrame's portal token call asks for "username" which is sometimes but not always the same as email

## What this updates in the wiki

- Core content source for [[Integration Patterns]], [[Custom Parameters]], [[iFrame Pricer UI]], [[MI Quotes]], [[Polly Loan Service]]
