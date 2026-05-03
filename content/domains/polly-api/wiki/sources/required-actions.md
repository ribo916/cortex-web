---
title: "Source: Events — Real-Time Required Actions"
type: source
tags: [real-time-actions, pipeline-monitoring, loan-service]
created: 2026-05-02
updated: 2026-05-02
sources: [required-actions-aka-realtime-pipeline-monitoring.md]
related: [wiki/concepts/real-time-actions.md]
---

# Source: Events — Real-Time Required Actions

**File:** `raw/devhub-guides/required-actions-aka-realtime-pipeline-monitoring.md`

## Summary

Decision matrix for Real-Time Actions (org-level config, Loan Service only). Shows which webhook fires based on: pricing comparison outcome (changed/unchanged) × auto-approve policy flag #1 (on/off) × auto-approve policy flag #2 (all reprices vs price unchanged only).

## Key claims

- 8 outcome combinations; 3 possible webhooks: `lock.autoRepriceNoPricingChangeNoActionRequired`, `lock.autoRepricePricingChangedNoActionRequired`, `loan.actionRequired`
- Fields that trigger reprice are customer-configurable
- Loan Service only; does not apply to native LOS integrations

## What this updates in the wiki

- Primary source for [[Real-Time Actions]]
