---
title: Missing and Recommended Developer Guides
type: analysis
tags: [documentation-gaps, guides, swagger, recommendations]
created: 2026-05-02
updated: 2026-05-02
sources: ["swagger: 2026_04_26_swagger.json", all devhub-guides]
related: [wiki/concepts/float-management.md, wiki/concepts/lock-extension.md, wiki/concepts/price-exception-workflow.md, wiki/concepts/lock-cancel-reset.md, wiki/analyses/swagger-api-inventory.md]
---

# Missing and Recommended Developer Guides

Analysis of documentation gaps discovered by cross-referencing the OpenAPI spec against existing developer hub guides. Organized by priority.

---

## Method

Compared all 19 API tags (~110 endpoints) against the 27 existing developer hub guides. Evaluated which tags have meaningful, complex workflows that an integration partner could not infer from the OpenAPI spec alone.

---

## High Priority — Completely Undocumented Tags

### 1. Float Management

**Tag:** `Float Management` — 3 endpoints  
**Current coverage:** Zero guides exist.  
**What it does:** Records a borrower's rate selection intent before committing to a lock. Captures full pricing context (product, rate, lock period, adjustments) against a peRequestId without triggering a lock approval workflow.  
**Who needs it:** Any API-only or hybrid integration that supports a "float" UX before locking.  
**Recommended guide title:** *"Float Requests — Recording Pre-Lock Rate Selections"*  
**Key points to cover:** When to use float vs lock; request/response structure; relationship to peRequestId; float vs float-down distinction; no approval workflow required.

---

### 2. Lock Extension

**Tag:** `Lock Management` endpoint  
**Current coverage:** Lock extension is listed in webhook event tables but no workflow guide exists.  
**What it does:** Extends a lock's expiration date, with a preview mode that shows fee impact before committing.  
**Who needs it:** Any lock-enabled integration where borrowers may need more time before closing.  
**Recommended guide title:** *"Lock Extensions — Extending Lock Expiration Dates"*  
**Key points to cover:** Preview vs commit; fee calculation; `daysToExtend` vs `actualDaysToExtend`; policy behavior and approval flow; confirmation document generation.

---

### 3. Lock Cancellation and Reset

**Tag:** `Lock Management` endpoints  
**Current coverage:** Mentioned in webhook catalog but no workflow guide exists.  
**What it does:** Cancellation ends a lock cleanly (leads to relock path); reset clears lock state entirely (error correction).  
**Who needs it:** All lock-enabled integrations.  
**Recommended guide title:** *"Lock Cancellation and Reset"*  
**Key points to cover:** When to use each; `losCancellationComment`; approval policy behavior; post-cancellation relock path; what "reset" means for loan state.

---

### 4. Price Exception — API Workflow

**Tag:** `Lock Management` + `Configuration: Lock Management`  
**Current coverage:** Price exception appears in webhook catalogs and lock management diagrams (images only in `raw/devhub-guides/lock-management-diagrams.md`). No written API workflow guide exists.  
**What it does:** Reduces pricing below the rate sheet by drawing from branch or corporate margin pools. Requires approval from a configured approver group.  
**Who needs it:** All API-only integrations building Lock Desk tools; integrations that need to understand exception state in the lock record.  
**Recommended guide title:** *"Price Exception Workflow — Requesting, Approving, and Denying Price Exceptions"*  
**Key points to cover:** Reasons endpoint; type (branch/corporate); preview mode; attachment upload; approval groups; multi-tier approval; `requestAndApprove` admin override; `lockPeriodOverride`; 412 precondition error.

---

### 5. Lock Desk — Approve and Deny API

**Tag:** `Lock Management`  
**Current coverage:** No guide covers how to build a programmatic Lock Desk tool.  
**What it does:** Allows API users to approve or deny any pending lock request (initial lock, reprice, relock, product change, price exception, extension, cancellation, reset).  
**Who needs it:** Integration partners building custom Lock Desk UIs; LOS integrations that route approvals through their own workflow engine.  
**Recommended guide title:** *"Programmatic Lock Desk — Approving and Denying Lock Requests via API"*  
**Key points to cover:** `LockReviewalRequest` (username, notes); approver group membership requirement; `needsAdditionalApprovals` for multi-tier; preapproval workflow (`/preapproval/` endpoint); retrieve lock request details before actioning.

---

## Medium Priority — Partial Coverage

### 6. Lock Request Notes

**Tag:** `Lock Management` — 3 endpoints  
**Current coverage:** Notes are mentioned as an option in price exception context but no standalone guide.  
**What it does:** Allows notes to be attached to any lock request record. Useful for communication between LOs and Lock Desk.  
**Recommended guide title:** Add as a section to *"Programmatic Lock Desk"* guide, or as a callout in the price exception guide.

---

### 7. Configuration: Lock Management — Full Setup Guide

**Tag:** `Configuration: Lock Management` — 16 endpoints  
**Current coverage:** Lock settings retrieval is implied; no guide covers setting up approver/requestor groups.  
**What it does:** Manages the full price exception permission model — which users can request exceptions (requestor groups), which users can approve (approver groups), and the reasons/types available.  
**Who needs it:** Admin tooling; onboarding automation.  
**Recommended guide title:** *"Configuring Price Exception Groups and Permissions"*  
**Key points to cover:** Approver vs requestor group distinction; user role requirements (Exception Approver role, Loan Officer role); groups are inactive until next pricing publish; group membership is immediate.

---

### 8. Preapproval Workflow

**Tag:** `Lock Management`  
**Endpoint:** `POST /pe/loans/{loanId}/lock-requests/{lockRequestId}/preapproval/`  
**Current coverage:** The lock validation workflow guide covers Polly's built-in pre-lock validation (New UI only). The preapproval endpoint (`/preapproval/`) is separate — it allows the integration partner to POST the result of their own external preapproval check back into Polly.  
**What it does:** Org-level feature. When enabled, Polly fires a webhook to the partner's system before completing a lock, waits for the partner to POST back APPROVED/DENIED/WARNING, then proceeds or halts accordingly.  
**Recommended guide title:** *"External Preapproval Integration"*  
**Key points to cover:** Must be enabled at org level; timeout behavior; `PreapprovalLockRequest` (result: APPROVED/DENIED/WARNING, messages array); use cases (compliance check, underwriting gateway).

---

### 9. Lock Confirmation Documents

**Tag:** `Lock Management`  
**Current coverage:** Mentioned in lock management webhook guide. No dedicated retrieval guide.  
**What it does:** After any lock approval, Polly generates a PDF confirmation document retrievable as base64.  
**Recommended addition:** A short guide or expanded section in the lock management overview explaining the document lifecycle: `lock.confirmationDocumentGenerated` → `GET /pe/lock-confirmation-documents/{lockRequestId}/` → decode `file.dataBase64`.

---

### 10. Configuration: Users — Full API

**Tag:** `Configuration: Users` — 10 endpoints  
**Current coverage:** User existence mentioned in iFrame portal token guide. No guide covers user lifecycle management.  
**What it does:** Full CRUD for Polly users; channel access management; custom parameter access control per user (allowed values restriction).  
**Who needs it:** Admin tooling; provisioning automation for onboarding new LOs.  
**Recommended guide title:** *"Managing Users and Channel Access"*  
**Key points to cover:** User roles; channel assignment; custom parameter allowed-values restriction per user; welcome email trigger.

---

## Lower Priority — Narrow Use Cases

### 11. Exchange — Co-Issuer Loans

**Tag:** `Exchange` — 1 endpoint  
**Current coverage:** Not documented.  
**What it does:** Retrieves loan and commitment details for a loan committed to the org as a servicing co-issuer. Very specific use case.  
**Recommended:** Short reference page for co-issuer integrations only.

---

### 12. Audit: Users

**Tag:** `Audit: Users` — 1 endpoint  
**Current coverage:** Not documented.  
**What it does:** `GET /pe/audit/logins/` — user login audit trail. Query parameters allow filtering.  
**Recommended:** Add as a section in the Users guide.

---

### 13. Dynamic Pricing Detail

**Tag:** `Pricing`  
**Endpoint:** `GET /pe/pricing-scenarios/{requestId}/products/{productId}/lock-periods/{lockPeriod}/rates/{rate}/dynamic-pricing-detail/`  
**Current coverage:** Not documented.  
**What it does:** Returns best-execution net price by evaluating all investors for the given scenario, product, lock period, and rate.  
**Recommended:** Add as a section in the pricing scenario guide.

---

### 14. Ineligible Matrix Analysis

**Tag:** `Pricing`  
**Endpoints:** Two endpoints for retrieving detailed eligibility matrix evaluations for ineligible products.  
**Current coverage:** Eligibility parsing guide covers `ruleResults` but not these dedicated analysis endpoints.  
**Who needs it:** Integrations that need to surface detailed ineligibility reasons beyond what's in the standard pricing response.  
**Recommended:** Add as an "Advanced Eligibility" section in the [[Eligibility and Pricing Response]] concept page.

---

## Documentation Debt — Existing Guides with Known Gaps

These are issues in existing guides that warrant updates rather than new guides:

| Issue | Location | Recommended fix |
|---|---|---|
| `peRequestId` location inconsistency | Multiple guides | Add a consolidated callout in the guide for each affected endpoint |
| Rate and price fields encoded as strings | API reference (swagger titles only) | Add field type notes to pricing scenario and lock request guides |
| Two `lock-policies` endpoints with different enum conventions | Not documented | Note in lock management overview |
| `requestAndApprove` admin override | Not documented as a pattern | Add a callout in reprice, relock, price exception guides |
| Loan Service field descriptions absent in Readme | Loan Service guide | Add field reference table using swagger schema data |
| Float vs Float Down distinction | Nowhere | Add to float management guide and lock management overview |
| Lock request `action` enum values | Only in lock history guide implicitly | Document full enum: LOCK, REPRICE, EXTENSION, RELOCK, CANCEL, PRODUCT_CHANGE, PRICE_EXCEPTION, FLOAT_DOWN, RESET |
