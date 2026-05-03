---
title: Lock Cancellation and Reset
type: concept
tags: [lock, cancellation, reset, lock-management, post-lock]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: Lock Management tag"]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/relock-workflow.md, wiki/concepts/webhooks.md]
---

# Lock Cancellation and Reset

Two distinct endpoints allow ending or reversing a lock state. They have similar request bodies but different outcomes.

---

## Lock Cancellation

**`POST /api/v2/pe/loans/{losLoanId}/lock-cancellation/`**

Cancels a pending or active lock. After cancellation, the loan can proceed through a **relock** if policy allows.

Note: The path parameter is `losLoanId` (not the internal Polly loan ID).

### Request body (`LockCancellationRequest`)

| Field | Type | Required | Description |
|---|---|---|---|
| `requestAndApprove` | boolean | No | Admin-only: auto-approve the cancellation |
| `losCancellationComment` | string | No | Optional comment for the cancellation reason |

### Response (`LockCancellationResponse`)

| Field | Type | Description |
|---|---|---|
| `autoApproved` | boolean | Whether the cancellation was auto-approved per policy |

### Webhook events

| Event | Meaning |
|---|---|
| `lock.lockCancellationRequestSubmitted` | Cancellation request received |
| `lock.lockCancellationRequestApproved` | Cancellation approved |
| `lock.lockCancellationRequestDenied` | Cancellation denied by Lock Desk |

### After cancellation

A cancelled lock can be re-established via **Relock** (see [[Relock Workflow]]). The relock will apply worst-case pricing if the loan is within the `wcpExpiryDate` window.

---

## Lock Reset

**`POST /api/v2/pe/loans/{losLoanId}/lock-reset/`**

Resets a lock — effectively reverting the loan back to an unlocked state. The description in the spec is: *"Request a lock reset on a locked loan."*

Reset is a more significant action than cancellation. It is used when the loan state must be cleared rather than simply cancelled (e.g., Lock Desk error correction, pre-pipeline cleanup).

Note: The path parameter is `losLoanId` (not the internal Polly loan ID).

### Request body (`RequestAndApprove`)

| Field | Type | Required | Description |
|---|---|---|---|
| `requestAndApprove` | boolean | No | Admin-only: auto-approve the reset |

### Response (`LockResetResponse`)

| Field | Type | Description |
|---|---|---|
| `autoApproved` | boolean | Whether the reset was auto-approved per policy |

### Webhook events

The `lockAction` enum includes `Reset` as a valid lock action. The webhook event pattern follows the standard convention:
- `lock.lockResetRequest*` (submitted/approved/denied)

---

## Cancellation vs. Reset — comparison

| Aspect | Lock Cancellation | Lock Reset |
|---|---|---|
| Intended use | Borrower/LO requested cancellation | Error correction, state cleanup |
| Post-action path | Relock workflow available | Loan returns to unlocked state |
| Comment field | `losCancellationComment` available | No comment field |
| Lock history preserved | Yes — creates cancellation record | Resets state |
| Typical initiator | LO or borrower | Lock Desk admin |

---

## Lock policies

Before submitting cancellation or reset, retrieve applicable policies:

`GET /api/v2/pe/loans/{loanId}/lock-policies/?lockAction=lockCancellation`

The `PoliciesResponse` includes:
- `changeSetId` — active changeset
- `productCode`, `productName`
- `appliedPolicies` — configured policies for the action

---

## Notes

- Both endpoints use `losLoanId` in the path, consistent with other loan-level Lock Management endpoints like `POST /pe/rate-lock/`.
- The `requestAndApprove` field bypasses the normal approval workflow and requires admin-level API access. In standard integrations, let the policy drive auto-approval or manual approval.
- Lock Desk approval is required for both actions unless the policy is set to auto-approve. Build your integration to handle both outcomes via webhooks.
- After a cancellation or reset, wait for the approved event before modifying the loan or attempting a relock. Acting on the "submitted" event alone can lead to race conditions.
