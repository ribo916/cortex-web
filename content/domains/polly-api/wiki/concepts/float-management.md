---
title: Float Management
type: concept
tags: [float, lock-management, pricing, undocumented]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: Float Management tag"]
related: [wiki/concepts/lock-management-overview.md, wiki/concepts/pricing-scenario.md, wiki/concepts/webhooks.md]
---

# Float Management

> **Documentation gap:** The Float Management API is absent from all Polly developer hub guides as of 2026-05-02. This page is derived entirely from the OpenAPI spec.

Float Management allows a borrower's rate selection to be recorded *before* they commit to a lock. A float request captures the pricing context (product, rate, lock period) at the moment the borrower expresses interest but does not lock. This is distinct from **Float Down**, which is a post-lock action available to already-locked borrowers (see [[Lock Management Overview]]).

---

## Endpoints

| Method | Path | Summary |
|---|---|---|
| `POST` | `/api/v2/pe/loans/{loanId}/float/` | Submit float request |
| `GET` | `/api/v2/pe/loans/{loanId}/float-requests/` | Retrieve all float requests for a loan |
| `GET` | `/api/v2/pe/loans/{loanId}/float-requests/{floatRequestId}/` | Retrieve a specific float request |

---

## Submitting a float request

**`POST /api/v2/pe/loans/{loanId}/float/`**

Records a borrower's intent to float at a specific rate and product. The float request is tied to a previously run pricing scenario via `peRequestId`.

### Request body (`FloatRequest`)

| Field | Type | Required | Description |
|---|---|---|---|
| `peRequestId` | string | Yes | Pricing Engine request ID from the pricing scenario run |
| `productCode` | string | Yes | Product code the borrower is floating on |
| `rate` | string | Yes | Rate the borrower is floating at (string-encoded decimal) |
| `lockPeriod` | integer | Yes | Lock period in days |

```json
{
  "peRequestId": "abc123",
  "productCode": "30YR-FIXED",
  "rate": "6.875",
  "lockPeriod": 30
}
```

---

## Float request response (`FloatHistoryResponse`)

Both the single and list retrieval endpoints return `FloatHistoryResponse` objects.

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Polly's internal float request ID |
| `requestedOn` | string | ISO 8601 timestamp |
| `requestedBy` | string | Display name of user who submitted |
| `term` | integer | Loan term |
| `loanProgram` | string | Program name |
| `productCode` | string | Product code |
| `productId` | string | Product ID |
| `changesetId` | string | Changeset (pricing version) in effect at float time |
| `audienceId` | string | Channel/audience context |
| `channel` | string | Channel name |
| `peRequestId` | string | Links back to the originating pricing scenario |
| `peRequestCreatedOn` | string | When the pricing scenario was run |
| `investor` | string | Investor name |
| `investorId` | integer | Investor tenant ID |
| `rate` | string | Rate floated at |
| `priceBeforeAdjustments` | string | Base price before LLPAs |
| `netPrice` | string | Net price after all adjustments |
| `finalParRate` | string | Par rate |
| `finalParPrice` | string | Par price |
| `lockPeriod` | integer | Lock period (nullable) |
| `armIndex` | string | ARM index (if applicable, nullable) |
| `armIndexRate` | string | ARM index rate (nullable) |
| `armBaseMargin` | string | ARM base margin (nullable) |
| `armNetMargin` | string | ARM net margin (nullable) |
| `fees` | array | Related fee objects |
| `adjustments` | array | Related adjustment objects |

---

## Float vs Float Down — key distinction

| Concept | When | API | What it means |
|---|---|---|---|
| **Float** (Float Management) | Before locking | `POST /pe/loans/{loanId}/float/` | Record borrower's pricing intent without committing to a lock |
| **Float Down** (Lock Management) | After locking | Part of Lock Management | Borrower exercises contractual right to take a lower market rate while locked |

Float Down triggers `lock.floatDownRequest*` webhook events. Float Management has no dedicated webhook events documented in the spec.

---

## Integration notes

- The `loanId` path parameter for float endpoints refers to the Polly internal loan ID, not the `losLoanId`. This is inconsistent with some other loan-scoped endpoints that accept `losLoanId` — verify against your integration's ID handling.
- Float requests capture the **changeset at the time of the float**, allowing historical reconstruction of what pricing was available when the borrower made their decision.
- There is no dedicated float confirmation document workflow. Confirmation documents are generated for lock actions, not float requests.
- No approval workflow is required for float requests — they are informational records.
