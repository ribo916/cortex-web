# Wiki Index

Catalog of all pages in this wiki. Updated by the LLM on every ingest, query-file, and lint pass.

**Stats:** 54 pages | 25 sources + 1 swagger spec ingested | Last updated: 2026-05-02

---

## Overview

| Page | Summary |
|------|---------|
| [Overview](overview.md) | What Polly is, integration archetypes, core architectural decisions, major themes |

---

## Entities (`wiki/entities/`)

| Page | Summary |
|------|---------|
| [Polly PPE](entities/polly-ppe.md) | Polly as a Product & Pricing Engine — base URL, API surface, versioning, credentials |
| [Polly Loan Service](entities/polly-loan-service.md) | Snapshot repository for non-native LOS integrations; data integrity and sync responsibilities |
| [Native LOS Integrations](entities/native-los-integrations.md) | Encompass, MeridianLink, Byte, Mortgage Director — what "native" means for integration design |
| [Lock Desk](entities/lock-desk.md) | Human approval team for lock requests; policy-driven; affects integration state machine |

---

## Concepts (`wiki/concepts/`)

| Page | Summary |
|------|---------|
| [Integration Patterns](concepts/integration-patterns.md) | **START HERE** — LOS/POS/CRM/Lead Gen archetypes, iFrame vs API-only vs Hybrid decision tree |
| [API Contract Quirks](concepts/api-contract-quirks.md) | Known Swagger gaps, enumeration mismatches, `peRequestId` inconsistencies, and other sharp edges |
| [Authentication](concepts/authentication.md) | OAuth 2.0 ROPC flow, token request/refresh, Postman setup |
| [Pricing Scenario](concepts/pricing-scenario.md) | Core pricing request structure, response shape, eligibility states, price formula |
| [Eligibility and Pricing Response](concepts/eligibility-and-pricing-response.md) | Full parsing guide — adjustments, clamps, eligibility rules, enumeration tables |
| [Lock Management — Overview](concepts/lock-management-overview.md) | Lock lifecycle, all lock actions, verification, policy behavior, confirmation documents |
| [Reprice Workflow](concepts/reprice-workflow.md) | Post-lock reprice using stored lock context; 3-step flow; legacy approach notes |
| [Relock Workflow](concepts/relock-workflow.md) | Re-establishing a lock after expiry/cancellation; worst-case pricing window |
| [Product Change Workflow](concepts/product-change-workflow.md) | Swap locked product; current API + legacy hypothetical approach |
| [iFrame Pricer UI](concepts/iframe-pricer-ui.md) | 3-step launch flow, modes, URL parameters, user/channel mechanics, troubleshooting |
| [Custom Parameters](concepts/custom-parameters.md) | Lender-defined fields; Pricing Engine vs Loan Service API distinction; LO access restrictions |
| [Webhooks](concepts/webhooks.md) | Full event catalog, payload format, subscription management, delivery behavior |
| [Webhook Security](concepts/webhook-security.md) | HMAC vs OAuth configuration; retry policy; self-diagnosis |
| [Batch Pricing](concepts/batch-pricing.md) | Bulk pricing via SFTP + CSV; workflow, format, chunked output |
| [MI Quotes](concepts/mi-quotes.md) | Direct Quoting vs Rate Cards; UI/API workflows; critical misconception |
| [Real-Time Actions](concepts/real-time-actions.md) | Org-level config for auto-repricing on Loan Service updates; decision matrix; when to avoid |
| [Lock Validation Workflow](concepts/lock-validation-workflow.md) | Pre-approval intercept for lock requests; New UI only; APPROVED/DENIED/WARNING |
| [Quote Generation](concepts/quote-generation.md) | Scenario Mode quote flow; webhook, rate-quote retrieval, detailed pricing |
| [Float Management](concepts/float-management.md) | Pre-lock float request API; distinct from Float Down; completely undocumented in guides |
| [Lock Extension](concepts/lock-extension.md) | Extend lock expiry; preview mode; fee calculation; approval flow |
| [Price Exception Workflow](concepts/price-exception-workflow.md) | Full API workflow: submit, preview, attachments, approver groups, approve/deny |
| [Lock Cancellation and Reset](concepts/lock-cancel-reset.md) | Cancel vs reset distinction; post-cancellation relock path |

---

## Sources (`wiki/sources/`)

| Page | Summary |
|------|---------|
| [Getting Started](sources/getting-started.md) | Onboarding: credentials, tooling, first steps |
| [Understanding Polly's APIs](sources/understanding-pollys-apis.md) | High-level capability overview |
| [Concepts and Considerations](sources/concepts-and-considerations.md) | Pre-integration design guide; 6 key gotcha areas |
| [Authentication](sources/authentication.md) | OAuth ROPC flow guide with cURL examples |
| [Polly Loan Service Overview](sources/polly-loan-service-overview.md) | Deep Loan Service guide; custom params; sync; Real-Time Actions |
| [iFraming Polly Pricer UI](sources/iframing-polly-pricer-ui.md) | iFrame launch guide; parameters; user/channel; troubleshooting |
| [Pricing Scenario Sample Request](sources/post-pricing-scenario-sample-request.md) | Example full JSON payload for pricing-scenario |
| [Parsing the Pricing Scenario Response](sources/parsing-the-pricing-scenario-response.md) | Price formula; adjustment types; clamps |
| [Determining Eligibility Failures](sources/determining-eligibility-failures.md) | Eligibility parsing; full enumeration integer mapping tables |
| [Lock Management Diagrams](sources/lock-management-diagrams.md) | Sequence diagrams for API-only, hybrid, and price exception flows (image-only guides) |
| [Lock Management Verification](sources/lock-management-verification.md) | Fields verified before lock actions; core + government loan specific |
| [Lock Validation Workflow](sources/lock-validation-workflow.md) | Pre-approval intercept; endpoint; statuses; timeout |
| [Webhook Overview](sources/webhook-overview.md) | Webhook suite overview; self-management; key developer considerations |
| [Webhook Notification Payload](sources/webhook-notification-payload.md) | CloudEvents 1.0 format; full event catalog as of Jan 2026 |
| [Webhook Retries](sources/webhook-retries.md) | Retry policy; subscription disable conditions; best practices |
| [Configuring Webhook Security](sources/configuring-webhook-security.md) | HMAC and OAuth security configuration; lifecycle notes |
| [Real-Time Required Actions](sources/required-actions.md) | Decision matrix for pipeline monitoring event outcomes |
| [Relock Workflow](sources/relock.md) | Relock API guide; worst-case pricing; policy config |
| [Reprice Pricing Workflow](sources/reprice-pricing-workflow.md) | Reprice API guide; storeRequestResult; legacy approach |
| [Product Change Workflow](sources/product-change-workflow.md) | Current product change API; known swagger issues |
| [Previous Product Change Workflow](sources/previous-product-change-workflow.md) | Legacy flow; still needed for hypothetical pricing on locked loans |
| [Generate Pricing Quotes](sources/generate-quotes.md) | Quote generation Scenario Mode flow; webhook; retrieval |
| [Pricing Using Batch APIs](sources/pricing-using-batch-apis.md) | Batch pricing SFTP + CSV workflow |
| [MI Quotes](sources/mi-quotes.md) | Direct Quoting and Rate Card paths |
| [Setting Up Postman](sources/setting-up-postman.md) | Postman import and auth configuration |

---

## Analyses (`wiki/analyses/`)

| Page | Summary |
|------|---------|
| [Swagger API Inventory](analyses/swagger-api-inventory.md) | Complete endpoint catalog — 19 tags, ~110 endpoints, organized by tag with summaries |
| [Missing and Recommended Developer Guides](analyses/missing-guides.md) | Documentation gaps identified from swagger; 14 recommended guides/additions, prioritized |

---

<!-- Maintenance note: add each new page as a row in the appropriate table. -->
