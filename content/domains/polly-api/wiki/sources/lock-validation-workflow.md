---
title: "Source: Lock Validation Workflow"
type: source
tags: [lock, pre-approval, validation]
created: 2026-05-02
updated: 2026-05-02
sources: [lock-validation-workflow.md]
related: [wiki/concepts/lock-validation-workflow.md]
---

# Source: Lock Validation Workflow

**File:** `raw/devhub-guides/lock-validation-workflow.md`

## Summary

Guide for the Lock Validation (pre-approval) workflow. A third-party system intercepts a lock request before it proceeds, sends a preapproval result (APPROVED/DENIED/WARNING), and Polly displays the result to the Loan Officer. Includes sequence diagram, endpoint details, and lock status notes.

## Key claims

- Only available for New UI organizations; not triggered by API-only lock requests
- Timeout: default 30s, max 120s
- Statuses `Pre Approval Pending` and `Pre Approval Denied` are only visible via API, not in Lock Desk UI
- HTTP 412 returned if preapproval result is submitted when lock is already in PreApproval Pending/Denied
- Initial release: LOCK workflow only

## What this updates in the wiki

- Primary source for [[Lock Validation Workflow]]
