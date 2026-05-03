---
title: Lock Extension
type: concept
tags: [lock, extension, lock-management, post-lock]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: Lock Management tag", lock-management-apis-only-approach.md]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/reprice-workflow.md, wiki/concepts/webhooks.md]
---

# Lock Extension

Lock Extension allows extending the expiration date of a currently locked loan. It supports a **preview mode** that shows the fee impact before committing to the extension.

---

## Endpoint

**`POST /api/v2/pe/loans/{loanId}/lock-extension/`**

### Query parameter

| Parameter | Type | Description |
|---|---|---|
| `isPreview` | string | If `"true"`, returns fee preview without creating a lock request. Defaults to false. |

---

## Request body (`LockExtensionRequest`)

| Field | Type | Required | Description |
|---|---|---|---|
| `daysToExtend` | integer | Yes | Number of days to extend the lock |
| `requestAndApprove` | boolean | No | Admin-only: auto-approve the extension request |
| `extensionFeePoints` | number | No | Override the extension fee in points |
| `extensionFeePrice` | number | No | Override the extension fee as a price value |

```json
{
  "daysToExtend": 15
}
```

---

## Response

Both preview (`200`) and committed (`200`) calls return the same shape. Preview responses do not create a lock request record.

### `LockExtensionResponse` / `LockExtensionPreviewResponse`

| Field | Type | Description |
|---|---|---|
| `peRequestId` | string | Pricing engine request ID |
| `currentLock` | object | Current lock details (see below) |
| `daysToExtend` | integer | Days being added |
| `extensionFeePoints` | number | Fee in points |
| `extensionFeeValue` | number | Fee as dollar/price value |
| `lockAfterExtension` | object | Projected lock state after extension |

### `currentLock` fields (`LockExtensionCurrentLock`)

| Field | Type |
|---|---|
| `lockRequestId` | string |
| `initialPrice` | string |
| ... | |

### `lockAfterExtension` fields

| Field | Description |
|---|---|
| `actualDaysToExtend` | Days added (may differ from requested if policy caps it) |
| `finalPrice` | Price after extension fee applied |
| `totalLockPeriod` | Total lock days after extension |
| `expiresAt` | New expiration date/time |

---

## Preview workflow (recommended)

Use preview before committing to communicate the fee impact to the borrower or loan officer:

```
1. POST /pe/loans/{loanId}/lock-extension/?isPreview=true
   → Returns fee preview, no lock record created

2. User confirms → 

3. POST /pe/loans/{loanId}/lock-extension/
   → Submits extension request, creates lock record
```

---

## Policy behavior

Like all lock actions, extensions go through the configured approval policy:

- **Auto-approved:** Extension completes immediately
- **Manual review:** Lock Desk must approve in Polly UI

Listen for `lock.lockExtensionRequest*` webhook events:
- `lock.lockExtensionRequestSubmitted`
- `lock.lockExtensionRequestApproved`
- `lock.lockExtensionRequestDenied`

After approval, a `lock.confirmationDocumentGenerated` event fires. Use `GET /pe/lock-confirmation-documents/{lockRequestId}/` to download the confirmation PDF.

---

## Lock policies

Call `GET /api/v2/pe/loans/{loanId}/lock-policies/?lockAction=lockExtension` to retrieve the extension policy for the loan before submitting. The `PoliciesResponse` includes:

- `changeSetId` — active changeset
- `productCode`, `productName`
- `appliedPolicies` — array of policies governing the extension

Use this to understand whether extensions are available for the current loan state.

---

## Notes

- Extension fees are calculated by Polly based on the configured rate sheet and extension fee policy. The optional `extensionFeePoints`/`extensionFeePrice` overrides require admin privileges (`requestAndApprove` pattern).
- The `daysToExtend` value in the response (`actualDaysToExtend`) may differ from the requested value if organizational policy caps maximum extension days.
- Multiple extensions may be possible depending on policy; each creates a new lock request record with action `EXTENSION`.
