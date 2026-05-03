---
title: Swagger API Inventory
type: analysis
tags: [swagger, api-surface, inventory, endpoints]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: 2026_04_26_swagger.json — OpenAPI 3.0.3, Polly API v2.0.0"]
related: [wiki/concepts/api-contract-quirks.md, wiki/concepts/lock-management-overview.md, wiki/concepts/float-management.md, wiki/concepts/price-exception-workflow.md]
---

# Swagger API Inventory

Complete endpoint catalog from the April 2026 Polly OpenAPI 3.0.3 spec. Organized by tag. **19 tags, ~110 endpoints.**

Base URL: `https://[environment].polly.io`  
All paths are prefixed with `/api/v2/`.

---

## Pricing (11 endpoints)

Core pricing engine — submit and retrieve pricing scenarios.

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/pricing-scenario/` | Request pricing (standalone, no loan record required) |
| `POST` | `/pe/loans/{losLoanId}/pricing-scenarios/` | Create pricing scenario from a loan (loan-scoped) |
| `POST` | `/pe/loans/{losLoanId}/reprice-pricing/` | Request Reprice Pricing (pricing for an already-locked loan) |
| `POST` | `/pe/loans/{losLoanId}/product-change-pricing/` | Request product change pricing (eligibility for available mapped products) |
| `GET` | `/pe/pricing-scenarios/{requestId}/` | Retrieve all pricing for a previous run |
| `GET` | `/pe/pricing-scenarios/{requestId}/products/{productCodeOrId}/` | Retrieve pricing for a specific product |
| `GET` | `/pe/pricing-scenarios/{requestId}/products/{productCodeOrId}/rates/{rate}/` | Retrieve pricing for a specific rate |
| `GET` | `/pe/pricing-scenarios/{requestId}/products/{productId}/lock-periods/{lockPeriod}/rates/{rate}/dynamic-pricing-detail/` | Retrieve dynamic pricing detail (best-ex net price) |
| `GET` | `/pe/pricing-scenarios/{requestId}/products/{productId}/rule-analysis/ineligible-matrices/` | Retrieve ineligible eligibility matrices |
| `GET` | `/pe/pricing-scenarios/{requestId}/products/{productId}/rule-analysis/ineligible-matrices/{matrixId}/` | Retrieve a specific ineligible matrix |
| `GET` | `/pe/rates/{rateId}/` | Retrieve base rates by rate ID |

---

## Lock Management (22 endpoints)

Full post-pricing lock lifecycle.

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/rate-lock/` | Request initial rate lock |
| `POST` | `/pe/loans/{loanId}/reprice/` | Request reprice |
| `POST` | `/pe/loans/{loanId}/relock/` | Request relock |
| `POST` | `/pe/loans/{loanId}/relock-pricing/` | Request relock pricing |
| `POST` | `/pe/loans/{loanId}/product-change/` | Request product change |
| `GET` | `/pe/loans/{loanId}/product-change-mapping/` | Retrieve product mapping |
| `POST` | `/pe/loans/{loanId}/price-exception/` | Request price exception (supports `?isPreview`) |
| `POST` | `/pe/loans/{loanId}/lock-extension/` | Request lock extension (supports `?isPreview`) |
| `POST` | `/pe/loans/{losLoanId}/lock-cancellation/` | Request lock cancellation |
| `POST` | `/pe/loans/{losLoanId}/lock-reset/` | Request lock reset |
| `GET` | `/pe/loans/{loanId}/lock-requests/` | Retrieve all lock requests for a loan |
| `GET` | `/pe/loans/{loanId}/lock-requests/{lockRequestId}/` | Retrieve a specific lock request |
| `POST` | `/pe/loans/{loanId}/lock-requests/{lockId}/approve/` | Approve a pending lock request |
| `POST` | `/pe/loans/{loanId}/lock-requests/{lockId}/deny/` | Deny a pending lock request |
| `POST` | `/pe/loans/{loanId}/lock-requests/{lockRequestId}/preapproval/` | Post preapproval result |
| `GET` | `/pe/loans/{loanId}/lock-policies/` | Retrieve loan-level lock policies |
| `GET` | `/pe/loans/{loanId}/policies/` | Retrieve loan-level lock policies (alternate endpoint, different lockAction filter values) |
| `GET` | `/pe/lock-confirmation-documents/{lockRequestId}/` | Retrieve lock confirmation document |
| `GET` | `/pe/lock-requests/{lockRequestId}/notes/` | Retrieve lock request notes |
| `POST` | `/pe/lock-requests/{lockRequestId}/notes/` | Create lock request note |
| `GET` | `/pe/lock-requests/{lockRequestId}/notes/{noteId}/` | Retrieve a specific note |
| `POST` | `/pe/price-exception-attachments/` | Upload a price exception document |

> Note: Two lock-policies endpoints exist with overlapping functionality but different `lockAction` filter enums. See [[API Contract Quirks]].

---

## Float Management (3 endpoints)

> No developer hub guide exists for this tag as of 2026-05-02. See [[Float Management]].

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/loans/{loanId}/float/` | Submit float request |
| `GET` | `/pe/loans/{loanId}/float-requests/` | Retrieve float requests |
| `GET` | `/pe/loans/{loanId}/float-requests/{floatRequestId}/` | Retrieve a specific float request |

---

## Loan Management (6 endpoints)

Polly Loan Service — snapshot repository for non-native LOS integrations.

| Method | Path | Summary |
|---|---|---|
| `GET` | `/loans/` | Retrieve all loans in the pipeline |
| `POST` | `/loans/` | Create a loan |
| `GET` | `/loans/{losLoanId}/` | Retrieve a single loan |
| `PUT` | `/loans/{losLoanId}/` | Update an entire loan |
| `PATCH` | `/loans/{losLoanId}/` | Update specific fields of a loan |
| `DELETE` | `/loans/{losLoanId}/` | Delete a loan |

---

## Quote Generation (2 endpoints)

Scenario Mode quote flow — borrower-facing quotes before rate selection.

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/quote-scenario/` | Create a scenario request for quote generation |
| `GET` | `/pe/rate-quotes/{rateQuoteId}/` | Retrieve rate quotes generated via Polly UI |

---

## MI Quotes (3 endpoints)

Mortgage Insurance quotes via Direct Quoting path. Not needed for Rate Card MI customers.

| Method | Path | Summary |
|---|---|---|
| `POST` | `/mi-quotes/` | Submit MI quote request |
| `GET` | `/mi-quotes/{miRequestId}/` | Retrieve MI quotes |
| `GET` | `/mi-quotes/{miRequestId}/selection/` | Retrieve selected MI Quote |

---

## Batch Pricing (2 endpoints)

Bulk pricing via API (SFTP/CSV workflow uses separate infrastructure).

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/batch-pricing/` | Create and start a batch pricing request |
| `GET` | `/pe/batch-pricing/{id}/` | Retrieve batch status and output SFTP link |

---

## iFrame/Portal (1 endpoint)

| Method | Path | Summary |
|---|---|---|
| `POST` | `/pe/portal-authentication/` | Retrieve portal login token for a UI user session (single-use, 5min TTL) |

---

## Configuration: Pricing (11 endpoints)

Read access to the pricing catalog — changesets, products, channels, custom parameters, base rates.

| Method | Path | Summary |
|---|---|---|
| `GET` | `/changesets/` | Retrieve all changesets |
| `GET` | `/changesets/{changesetId}/` | Retrieve a single changeset by ID |
| `GET` | `/changesets/{changesetId}/products/` | Retrieve products in a changeset |
| `GET` | `/changesets/{changesetId}/products/{productId}/` | Retrieve a specific product |
| `GET` | `/pe/changeset/{changesetId}/channels/{channelId}/products/` | Retrieve products for a channel |
| `GET` | `/pe/changesets/{changesetId}/channels/` | Retrieve channels for a changeset |
| `GET` | `/pe/custom-parameters/` | Retrieve Pricing Engine custom parameters |
| `GET` | `/pe/custom-parameters/{customParameterId}/` | Retrieve a specific custom parameter |
| `GET` | `/pe/rates/` | Retrieve base rate sets |
| `GET` | `/products/` | Retrieve products info |
| `GET` | `/products/{productId}/` | Retrieve a product's info |

---

## Configuration: Lock Management (16 endpoints)

Lock settings, price exception approver/requestor groups.

| Method | Path | Summary |
|---|---|---|
| `GET` | `/configurations/lock-settings/` | Retrieve lock settings for the org |
| `GET` | `/changesets/{changesetId}/channels/{channelId}/products/{productId}/lock-policies/` | Retrieve policies by channel by product |
| `GET` | `/changesets/{changesetId}/products/{productId}/lock-policies/` | Retrieve product policies |
| `GET` | `/pe/price-exception-approver-groups/` | List all PE approver groups |
| `POST` | `/pe/price-exception-approver-groups/` | Create an approver group |
| `GET` | `/pe/price-exception-approver-groups/{id}/` | Retrieve approver group details |
| `PATCH` | `/pe/price-exception-approver-groups/{id}/` | Update an approver group |
| `POST` | `/pe/price-exception-approver-groups/{id}/approvers/` | Add user to approver group |
| `DELETE` | `/pe/price-exception-approver-groups/{id}/approvers/{approverId}/` | Remove user from approver group |
| `GET` | `/pe/price-exception-reasons/` | Retrieve available PE exception reasons |
| `GET` | `/pe/price-exception-requestor-groups/` | List all PE requestor groups |
| `POST` | `/pe/price-exception-requestor-groups/` | Create a requestor group |
| `GET` | `/pe/price-exception-requestor-groups/{id}/` | Retrieve requestor group details |
| `PATCH` | `/pe/price-exception-requestor-groups/{id}/` | Update a requestor group |
| `POST` | `/pe/price-exception-requestor-groups/{id}/requestors/` | Add user to requestor group |
| `DELETE` | `/pe/price-exception-requestor-groups/{id}/requestors/{requestorId}/` | Remove user from requestor group |

---

## Configuration: Users (10 endpoints)

Polly user management and custom parameter access control.

| Method | Path | Summary |
|---|---|---|
| `GET` | `/pe/users/` | Retrieve users |
| `POST` | `/pe/users/` | Create a user |
| `GET` | `/pe/users/{userId}/` | Retrieve user details |
| `PATCH` | `/pe/users/{userId}/` | Update a user |
| `GET` | `/pe/users/{userId}/channels/` | Retrieve channel access for a user |
| `GET` | `/pe/users/{userId}/parameters/` | Retrieve custom parameter access for a user |
| `POST` | `/pe/users/{userId}/parameters/` | Assign custom parameter to a user |
| `PUT` | `/pe/users/{userId}/parameters/{parameterId}/` | Update allowed values for a user's custom parameter |
| `DELETE` | `/pe/users/{userId}/parameters/{parameterId}/` | Remove custom parameter from a user |
| `POST` | `/pe/users/{userId}/welcome/` | Send welcome email to user |

---

## Configuration: Loan Management (5 endpoints)

Loan Service custom parameter management (distinct from Pricing Engine custom parameters).

| Method | Path | Summary |
|---|---|---|
| `GET` | `/custom-parameters/` | Retrieve Loan Service custom parameters |
| `POST` | `/custom-parameters/` | Create a Loan Service custom parameter |
| `GET` | `/custom-parameters/{customParameterId}/` | Retrieve a Loan Service custom parameter |
| `PUT` | `/custom-parameters/{customParameterId}/` | Update a Loan Service custom parameter |
| `DELETE` | `/custom-parameters/{customParameterId}/` | Remove a Loan Service custom parameter |

> Note: `/api/v2/custom-parameters/` (Loan Management) vs `/api/v2/pe/custom-parameters/` (Configuration: Pricing) — the `pe/` prefix distinguishes the Pricing Engine endpoints from the Loan Service endpoints.

---

## Configuration: Webhooks (7 endpoints)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/event-types/` | Retrieve all subscribable events |
| `GET` | `/webhooks/` | Retrieve subscribed webhooks |
| `POST` | `/webhooks/` | Subscribe to events |
| `GET` | `/webhooks/{webhookId}/` | Retrieve a subscription |
| `PUT` | `/webhooks/{webhookId}/` | Replace a subscription |
| `PATCH` | `/webhooks/{webhookId}/` | Partially update a subscription |
| `DELETE` | `/webhooks/{webhookId}/` | Unsubscribe |

---

## Configuration: HMAC Security (4 endpoints)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/security/hmac/` | Get HMAC config |
| `POST` | `/security/hmac/` | Create HMAC config |
| `PATCH` | `/security/hmac/{hmacId}/` | Update HMAC config |
| `DELETE` | `/security/hmac/{hmacId}/` | Delete HMAC config |

---

## Configuration: OAUTH Security (4 endpoints)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/security/oauth/` | Get OAuth config |
| `POST` | `/security/oauth/` | Create OAuth config |
| `PATCH` | `/security/oauth/{oauthId}/` | Update OAuth config |
| `DELETE` | `/security/oauth/{oauthId}/` | Delete OAuth config |

---

## Configuration: Rate Sheets (2 endpoints)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/changesets/{changesetId}/generated-rate-sheets/` | Retrieve generated rate sheet templates |
| `GET` | `/changesets/{changesetId}/generated-rate-sheets/{rateSheetTemplateId}/` | Retrieve a specific template |

---

## Webhook Notification (2 endpoints)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/webhook-notifications/` | Retrieve all webhook delivery logs (missed notifications) |
| `GET` | `/webhook-notifications/{id}/` | Retrieve a specific webhook delivery log |

---

## Audit: Users (1 endpoint)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/pe/audit/logins/` | Retrieve user login audit trail entries |

---

## Exchange (1 endpoint)

| Method | Path | Summary |
|---|---|---|
| `GET` | `/exchange/co-issuer/loans/{exchangeLoanId}/` | Retrieve loan and commitment details for a co-issuer loan |

---

## Endpoints not in the spec

The following endpoint is used in practice but does not appear in the OpenAPI spec:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v2/auth/token/` | OAuth 2.0 ROPC token request (authentication) |

See [[Authentication]] for the cURL template.

---

## Schema count

288 component schemas defined in the spec. Key schemas:
- Lock workflows: `InitialRateLockRequest`, `LockRequest`, `LockReviewalRequest`, `LockCancellationRequest`, `LockExtensionRequest`, `RelockPricingRequest`, `RelockRequest`, `ProductChangeRequest`
- Price exception: `PriceExceptionRequest`, `PriceExceptionResponse`, `ApprovalGroupRequest`, `ApprovalGroupResponse`
- Pricing: `PricingScenarioRequest`, `RelockPricingDataResponse`, `FloatRequest`, `FloatHistoryResponse`
- Loan Service: `CreateLoanRequest`, `CreateBorrowerRequest`, `CreatePropertyRequest`
