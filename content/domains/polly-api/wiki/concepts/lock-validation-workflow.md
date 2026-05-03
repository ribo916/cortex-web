---
title: Lock Validation Workflow (Pre-Approval)
type: concept
tags: [lock, pre-approval, validation, webhook]
created: 2026-05-02
updated: 2026-05-02
sources: [lock-validation-workflow.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/webhooks.md, wiki/entities/lock-desk.md]
---

# Lock Validation Workflow (Pre-Approval)

The Lock Validation Workflow allows a third-party system to intercept a lock request and send a pre-approval decision **before the lock proceeds to the normal approval flow**. It puts a pause on the lock submission, giving the third party time to validate the request independently.

---

## When this applies

- Uncommon; available only to organizations using Polly's **New UI**
- Cannot be triggered through API-only lock requests — requires the lock to be submitted via the Polly Pricer UI (including iFrame)
- Initial release supports the LOCK workflow only; future workflows may be added

---

## Flow

```
1. Loan Officer clicks Lock in Polly UI
2. Polly shows Lock Verification Modal to LO (lock is paused)
3. Polly fires: lock.lockActionPendingApproval (webhook)
4. Third-party system receives event
5. Third party retrieves loan/pricing data (optional supporting calls)
6. Third party calls POST /loans/{losLoanId}/lock-requests/{lockRequestId}/preapproval
7. Polly displays result to LO:
   - APPROVED → lock proceeds normally
   - DENIED   → LO sees denial reasons; must cancel and re-request
   - WARNING  → LO sees warnings; can proceed or cancel
```

---

## Preapproval endpoint

`POST /api/v2/loans/{losLoanId}/lock-requests/{lockRequestId}/preapproval`

```json
{
  "result": "APPROVED",
  "messages": ["Optional message for denial reasons or warnings"]
}
```

**Results:**
- `APPROVED` — lock proceeds as a normal request
- `DENIED` — LO sees denial reason in Polly UI; lock must be cancelled via modal to re-request
- `WARNING` — LO sees warning messages and chooses to proceed or cancel

HTTP 412 is returned if an APPROVED or DENIED call is made via the Public API when the lock is already in `PreApproval Pending` or `PreApproval Denied` status.

---

## Lock statuses (API-visible only)

- `Pre Approval Pending` — awaiting preapproval result
- `Pre Approval Denied` — denied during preapproval

These statuses are **not visible in Lock Desk UI** — only accessible via API.

---

## Timeout behavior

Polly has a configurable timeout for pre-approval responses:
- Default: 30 seconds
- Maximum: 120 seconds

Design your third-party system to respond within this window. Handle timeout scenarios in your implementation.

---

## Optional supporting API calls

While processing the pre-approval, the third party may call:
- `GET /api/v2/loans/{losLoanId}` — retrieve loan data
- `GET /api/v2/pe/loans/{loanId}/lock-requests/{lockRequestId}` — lock request details
- `GET /api/v2/pe/pricing-scenarios/{requestId}` — full pricing data
- `GET /api/v2/pe/pricing-scenarios/{requestId}/products/{productCodeOrId}/rates/{rate}` — specific rate pricing
