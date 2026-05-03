---
title: Price Exception Workflow
type: concept
tags: [price-exception, lock-management, approver-groups, requestor-groups, lock-desk]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: Lock Management + Configuration: Lock Management tags"]
related: [wiki/concepts/lock-management-overview.md, wiki/entities/lock-desk.md, wiki/concepts/webhooks.md, wiki/concepts/iframe-pricer-ui.md]
---

# Price Exception Workflow

A price exception is a reduction in loan pricing (below the standard rate sheet) granted on a specific locked loan. It eats into lender margin and typically requires approval from a Lock Desk user in an authorized approver group.

Polly supports both an **API-driven workflow** and a **UI-driven workflow** (via iFrame). Most API-only integrations and Lock Desk tools need the full workflow below.

---

## Workflow overview

```
1. (Optional) Preview exception pricing → ?isPreview=true
2. (Optional) Upload supporting documents → POST /pe/price-exception-attachments/
3. Submit exception request → POST /pe/loans/{loanId}/price-exception/
4. Exception enters pending state → webhook: lock.priceExceptionRequestSubmitted
5. Lock Desk reviews:
   a. Auto-approved: → lock.priceExceptionRequestApproved
   b. Manual approval:
      - Look up approver group → GET /pe/price-exception-approver-groups/
      - POST /pe/loans/{loanId}/lock-requests/{lockId}/approve/  (or deny)
      - Webhook: lock.priceExceptionRequestApproved / lock.priceExceptionRequestDenied
6. Confirmation document generated → lock.confirmationDocumentGenerated
```

---

## Step 0 — Retrieve available reasons

`GET /api/v2/pe/price-exception-reasons/`

Retrieves the org-configured list of valid exception types and reasons. Call this before presenting the exception request form to the user.

Response (`PriceExceptionReasonsResponse`) includes an array of `PriceExceptionReason` objects:

| Field | Type | Values |
|---|---|---|
| `reason` | string | Human-readable reason text |
| `type` | string | `Branch` or `Corporate` |

The `type` determines which exception pool (branch margin vs. corporate margin) the exception draws from.

---

## Step 1 — Preview the exception (optional)

`POST /api/v2/pe/loans/{loanId}/price-exception/?isPreview=true`

Returns the projected pricing impact without creating a lock request record. The `PriceExceptionPreviewResponse` does not include a `lockRequestId`.

---

## Step 2 — Upload supporting documents (optional)

`POST /api/v2/pe/price-exception-attachments/`

Upload supporting documents (e.g., competing offer, approval email). Returns `documentAttachmentIds` to reference in the exception request body.

---

## Step 3 — Submit the exception request

`POST /api/v2/pe/loans/{loanId}/price-exception/`

### Request body (`PriceExceptionRequest`)

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `branch` or `corporate` — which margin pool to draw from |
| `reason` | string | Yes | Must match a configured reason from the reasons endpoint |
| `points` | string | Conditional | Exception amount in points (string-encoded decimal). At least one of `points` or `dollarAmount` required. |
| `dollarAmount` | string | Conditional | Exception as dollar amount. At least one of `points` or `dollarAmount` required. |
| `notes` | string | No | Notes for the exception request. Also addable post-submission via lock request notes. |
| `documentAttachmentIds` | array | No | IDs from Step 2 upload |
| `lockPeriodOverride` | integer | No | Override lock expiration to N days from today (UTC) |
| `username` | string | No | Requestor username (if submitting on behalf of an LO) |
| `requestAndApprove` | boolean | No | Admin-only: auto-approve during submission |

### Response codes

| Code | Meaning |
|---|---|
| `200` | Preview response (isPreview=true) — no lockRequestId |
| `201` | Exception submitted — returns `PriceExceptionResponse` |
| `412` | LOS loan data has changed — must update loan before retrying |
| `422` | Validation error (invalid type, missing fields) |

### Response (`PriceExceptionResponse`)

```
{
  "priorPricing": {
    "lockRequestId": <integer>,
    "peRequestId": "<string>",
    "totalAdjustment": "<string>",
    "finalPrice": "<string>",
    "numberOfAttachments": <integer>,
    "numberOfNotes": <integer>
  },
  "exceptionPricing": {
    "peRequestId": "<string>",
    "totalAdjustment": "<string>",
    "finalPrice": "<string>",
    "numberOfAttachments": <integer>,
    "attachmentIds": [...],
    "lockRequestId": <integer>,
    "numberOfNotes": <integer>,
    "noteIds": [...],
    "autoApproved": <boolean>,
    "isPending": <boolean>
  }
}
```

- `autoApproved: true` means the exception was immediately approved per policy
- `isPending: true` means it requires Lock Desk review

---

## Step 4 — Approve or deny (Lock Desk)

If `isPending` is true, a user with Lock Desk permissions must action the request.

### Look up who can approve

`GET /api/v2/pe/price-exception-approver-groups/`

Returns all approver groups configured for the org. Each `ApprovalGroupResponse` has:

| Field | Description |
|---|---|
| `approverGroupId` | Group ID (use to look up specific approvers) |
| `approverGroupName` | Display name |
| `isActiveGroup` | Whether the group is active in the current pricing version |
| `isDeleted` | Soft-delete flag |
| `approvers` | Array of user objects in the group |

`GET /api/v2/pe/price-exception-approver-groups/{approverGroupId}/` — retrieve all approvers in a specific group.

The `LockReviewalResponse.approverGroup` field (integer ID) on a pending lock request tells you which approver group must action it.

### Approve

`POST /api/v2/pe/loans/{loanId}/lock-requests/{lockId}/approve/`

```json
{
  "username": "lockdesk.user@lender.com",
  "notes": "Approved — competitor match confirmed"
}
```

The `username` must be a user in the required approver group. Returns `LockReviewalResponse`.

**422 error:** "The user is not in the approval group needed to approve this Price Exception" — wrong user for the required group.

### Deny

`POST /api/v2/pe/loans/{loanId}/lock-requests/{lockId}/deny/`

Same request body. Returns `LockReviewalResponse`.

**422 error:** "User is not a valid approver and does not have the lock desk permissions needed to deny this Price Exception."

### `LockReviewalResponse` fields

| Field | Description |
|---|---|
| `action` | Lock action type |
| `decision` | `APPROVED` or `DENIED` |
| `writebackStatus` | LOS writeback status (starts as `processing`) |
| `needsAdditionalApprovals` | True if multiple approval groups are required (exception management with multi-tier approval) |
| `approverGroup` | Next approver group ID if `needsAdditionalApprovals` is true |
| `requestedOn` | ISO 8601 timestamp |
| `reviewedOn` | ISO 8601 timestamp |

---

## Lock request notes

Notes can be added to a lock request at any time, separate from the submission notes:

- `GET /api/v2/pe/lock-requests/{lockRequestId}/notes/` — retrieve all notes
- `POST /api/v2/pe/lock-requests/{lockRequestId}/notes/` — create a note
- `GET /api/v2/pe/lock-requests/{lockRequestId}/notes/{noteId}/` — retrieve a specific note

---

## Approver and requestor group management

These are configuration-level endpoints (admin use, not per-transaction). Found under the `Configuration: Lock Management` tag.

### Approver groups

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/pe/price-exception-approver-groups/` | List all groups |
| `POST` | `/pe/price-exception-approver-groups/` | Create new group |
| `GET` | `/pe/price-exception-approver-groups/{id}/` | Get group + members |
| `PATCH` | `/pe/price-exception-approver-groups/{id}/` | Update group |
| `POST` | `/pe/price-exception-approver-groups/{id}/approvers/` | Add user to group |
| `DELETE` | `/pe/price-exception-approver-groups/{id}/approvers/{approverId}/` | Remove user from group |

New groups are created with `isActive = false` and become active after the next pricing version is published.

Users must have the `Exception Approver` role to be added to approver groups.

### Requestor groups

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/pe/price-exception-requestor-groups/` | List all groups |
| `POST` | `/pe/price-exception-requestor-groups/` | Create new group |
| `GET` | `/pe/price-exception-requestor-groups/{id}/` | Get group + members |
| `PATCH` | `/pe/price-exception-requestor-groups/{id}/` | Update group |
| `POST` | `/pe/price-exception-requestor-groups/{id}/requestors/` | Add user |
| `DELETE` | `/pe/price-exception-requestor-groups/{id}/requestors/{requestorId}/` | Remove user |

Users must have the `Loan Officer` role to be added to requestor groups.

Requestor groups control which LOs are permitted to request exceptions and tie into the pricing policy configuration.

---

## Webhook events

| Event | Meaning |
|---|---|
| `lock.priceExceptionRequestSubmitted` | Exception submitted |
| `lock.priceExceptionRequestApproved` | Exception approved |
| `lock.priceExceptionRequestDenied` | Exception denied |
| `lock.confirmationDocumentGenerated` | Confirmation PDF ready (after approval) |

---

## Notes

- Exception policies are configured in the pricing version and take effect on the next publish. Group membership changes are immediate but group activation is tied to publishing.
- The `lockPeriodOverride` is useful when the standard lock period would expire before the exception is likely to be approved.
- **Multi-tier approval:** `needsAdditionalApprovals: true` in the reviewal response means another approver group must still act. The `approverGroup` field gives the next group ID.
- The 412 error (LOS loan data changed) is the same precondition check that occurs for all lock actions. The error detail includes a diff of what changed.
- Both `type` values (`branch`, `corporate`) must be lowercase in the request, even though the `PriceExceptionReason` response returns them as `Branch`, `Corporate` (capitalized).
