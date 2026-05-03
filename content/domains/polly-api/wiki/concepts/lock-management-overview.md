---
title: Lock Management — Overview
type: concept
tags: [lock, lock-management, initial-lock, reprice, relock, product-change, price-exception, float-down]
created: 2026-05-02
updated: 2026-05-02
sources: [lock-management-apis-only-approach.md, lock-management-hybrid-approach.md, lock-management-verification.md]
related: [wiki/concepts/reprice-workflow.md, wiki/concepts/relock-workflow.md, wiki/concepts/product-change-workflow.md, wiki/concepts/integration-patterns.md, wiki/concepts/webhooks.md, wiki/entities/lock-desk.md, wiki/concepts/iframe-pricer-ui.md, wiki/concepts/lock-validation-workflow.md]
---

# Lock Management — Overview

Lock management covers the full lifecycle of a mortgage rate lock in Polly: from initial lock through all post-lock modifications (reprice, relock, product change, price exception, float down) to cancellation.

---

## Lock lifecycle states

```
[Pricing] → [Initial Lock Submitted] → [Pending Lock Approval | Auto-Approved]
                                              ↓
                                       [Locked]
                                              ↓ (various workflows)
                                    Reprice / Relock / Product Change /
                                    Price Exception / Float Down / Extension
                                              ↓
                                    [Cancelled | Expired]
                                              ↓
                                    [Relock] (if policy allows)
```

Every transition has:
1. A **submitted** event (fires immediately on request)
2. An **approved** or **denied** event (fires after Lock Desk decision or auto-approval)

---

## Lock actions summary

| Action | When used | Guide |
|---|---|---|
| **Initial Lock** | First lock on a loan | `POST /pe/rate-lock/` |
| **Reprice** | Loan data changed after lock; re-evaluate pricing against existing lock context | [[Reprice Workflow]] |
| **Relock** | Prior lock expired or cancelled; re-establish a pricing commitment | [[Relock Workflow]] |
| **Product Change** | Swap locked product for a mapped alternative | [[Product Change Workflow]] |
| **Price Exception** | Reduce pricing to meet competition; eats into lender margin | [[Price Exception Workflow]] |
| **Float Down** | Borrower exercises right to take a lower rate if market improves | webhook events; no standalone guide |
| **Lock Extension** | Extend lock expiry date; supports preview mode | [[Lock Extension]] |
| **Lock Cancellation** | Cancel a pending or active lock; leads to relock path | [[Lock Cancellation and Reset]] |
| **Lock Reset** | Clear lock state entirely (error correction) | [[Lock Cancellation and Reset]] |
| **Float** | Record borrower's pre-lock rate intent without committing | [[Float Management]] |

---

## Integration approaches

### Hybrid (recommended for most)
Use the iFrame for the lock UX. Polly handles: price exception logic, concurrent lock + exception, Float Down, [[Lock Desk]] approval flows, worst-case pricing windows, product change UI. You handle: loan creation/update, webhook receipt, data reconciliation.

### API-only (headless)
Build the full lock UX in your application. You implement every workflow listed above. Complete UI control, significantly higher complexity. See the lock management diagram in `raw/devhub-guides/lock-management-apis-only-approach.md`.

See [[Integration Patterns]] for the full tradeoff analysis.

---

## Lock verification

Before any lock action is processed (initial lock, reprice, relock, extension, product change, price exception), Polly compares the pricing request to the loan record. If discrepancies exist, the request is rejected. The loan must be updated to match the pricing request before re-submitting.

**Always-verified fields** include: `amount`, `ltv`, `productCode`, `desiredLockPeriod`, `aus`, `impounds`, `propertyType`, `occupancy`, `state`, `county`, `fico`, `dtiRatio`, and others.

**Government loan fields** are additionally verified when the loan type matches: FHA fields for FHA loans, VA fields for VA loans, USDA fields for USDA loans.

Full field list: `raw/devhub-guides/lock-management-verification.md`.

---

## Policy-driven behavior

Every lock action has a configurable approval policy. Customers configure these in Polly. Integrations must handle both outcomes:
- **Auto-approved:** action completes immediately; approval webhook fires
- **Manual review:** Lock Desk reviews in Polly UI; approval or denial webhook fires after decision

Because policies vary per customer, never assume auto-approval. Build state tracking that waits for the approval event.

---

## Concurrent lock + price exception

In the Polly Pricer UI (iFrame), a Loan Officer can submit an initial lock and a price exception simultaneously. In this case:
- **Submitted** events fire immediately for both
- **Decision** events (approved/denied) are held until **both** the lock and the exception have been decisioned
- This does not apply to Float + Price Exception (float has no approval process)

---

## Lock confirmation documents

After any approval event (initial lock, reprice, relock, product change, extension, float down), Polly generates a lock confirmation document. If subscribed to `lock.confirmationDocumentGenerated`:
- This event follows the approval event
- Use `GET /lock-confirmation-documents` to download the base64 PDF payload
- Do not poll for the document using the approval event; wait for the dedicated document event

---

## Key webhook events

| Event | Meaning |
|---|---|
| `lock.initialLockRequestSubmitted` | Lock request received |
| `lock.initialLockRequestApproved` | Lock approved (auto or manual) |
| `lock.initialLockRequestDenied` | Lock denied by Lock Desk |
| `lock.pendingLockRequestCancelled` | Pending lock cancelled |
| `lock.repriceLockRequest*` | Reprice submitted/approved/denied |
| `lock.relockRequest*` | Relock submitted/approved/denied |
| `lock.productChangeRequest*` | Product change submitted/approved/denied |
| `lock.priceExceptionRequest*` | Price exception submitted/approved/denied |
| `lock.floatDownRequest*` | Float down submitted/approved/denied |
| `lock.lockExtensionRequest*` | Extension submitted/approved/denied |
| `lock.lockCancellationRequest*` | Cancellation submitted/approved/denied |
| `lock.confirmationDocumentGenerated` | Lock confirmation PDF ready |
| `lock.autoReprice*` | Auto-reprice triggered (Real-Time Actions) |

See [[Webhooks]] for the full event catalog.

---

## Approve and deny via API

Lock Desk operations can be driven programmatically. Two endpoints accept any pending lock request (initial lock, reprice, relock, product change, price exception, extension, cancellation, reset):

- `POST /api/v2/pe/loans/{loanId}/lock-requests/{lockId}/approve/`
- `POST /api/v2/pe/loans/{loanId}/lock-requests/{lockId}/deny/`

Both use `LockReviewalRequest` — `{ "username": "lockdesk@lender.com", "notes": "..." }`. The `username` must belong to the required approver group for the lock action. See [[Price Exception Workflow]] for the full approve/deny flow.

---

## Lock request notes

Notes can be added to any lock request record at any time, independent of the lock action:

- `GET /api/v2/pe/lock-requests/{lockRequestId}/notes/`
- `POST /api/v2/pe/lock-requests/{lockRequestId}/notes/`
- `GET /api/v2/pe/lock-requests/{lockRequestId}/notes/{noteId}/`

---

## Preapproval intercept (org-level feature)

When the preapproval feature is enabled, Polly fires a webhook to the integration partner's system before completing a lock. The partner calls back:

`POST /api/v2/pe/loans/{loanId}/lock-requests/{lockRequestId}/preapproval/`

```json
{
  "result": "APPROVED",   // APPROVED | DENIED | WARNING
  "messages": []          // array of user-facing messages (for WARNING or DENIED)
}
```

This is separate from Polly's built-in lock validation workflow (New UI only). See [[Lock Validation Workflow]] for the built-in version.

---

## Retrieve lock request history

`GET /api/v2/pe/loans/{loanId}/lock-requests/` — all lock requests for a loan  
`GET /api/v2/pe/loans/{loanId}/lock-requests/{lockRequestId}/` — specific request

The `LockRequest` schema includes:
- `action` — LOCK, REPRICE, EXTENSION, RELOCK, CANCEL, FLOAT_DOWN, PRODUCT_CHANGE, PRICE_EXCEPTION, RESET
- `decision` — APPROVED, DENIED, CANCELLED, FAILED, PENDING
- `approvalMode` — LOS_REVIEWAL, APP_REVIEWAL, AUTO_APPROVAL
- `writeBackStatus` — PENDING, PROCESSING, RETRYING, SUCCESS, FAILED
- `buySide` / `sellSide` — full pricing details including adjustments, fees, ARM fields
- `crossWorkflowLockRequests` — for concurrent lock + exception scenarios
