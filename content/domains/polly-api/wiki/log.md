# Wiki Log

Append-only chronological record of all wiki activity.

Quick grep: `grep "^## \[" wiki/log.md | tail -10`

---

## [2026-05-02] schema | Initial setup
- Created CLAUDE.md with full schema rules
- Created wiki/index.md (empty catalog)
- Created wiki/log.md (this file)
- Created directory structure: raw/, raw/assets/, wiki/entities/, wiki/concepts/, wiki/sources/, wiki/analyses/
- Wiki is ready for first ingest

---

## [2026-05-02] ingest-batch | 27 files — Polly Developer Hub guides
- Sources: all 27 files in raw/devhub-guides/
- **New pages (38 total):**
  - wiki/overview.md
  - Entities (4): polly-ppe.md, polly-loan-service.md, native-los-integrations.md, lock-desk.md
  - Concepts (14): integration-patterns.md, api-contract-quirks.md, authentication.md, pricing-scenario.md, eligibility-and-pricing-response.md, lock-management-overview.md, reprice-workflow.md, relock-workflow.md, product-change-workflow.md, iframe-pricer-ui.md, custom-parameters.md, webhooks.md, webhook-security.md, batch-pricing.md, mi-quotes.md, real-time-actions.md, lock-validation-workflow.md, quote-generation.md
  - Sources (25): one per guide (3 diagram-only guides combined into one source page)
- **Updated pages:** wiki/index.md (populated from empty)
- **Key additions:**
  - Integration Patterns concept page created as first-class reference for LOS/POS/CRM/Lead Gen archetypes and iFrame vs API-only vs Hybrid decision
  - API Contract Quirks concept page created capturing known Swagger gaps, `peRequestId` inconsistencies, enumeration type mismatches, and other sharp edges
  - Full webhook event catalog (as of Jan 2026) compiled into Webhooks concept page
  - Previous Product Change Workflow retained with explicit note on when the legacy flow is still needed (hypothetical pricing on locked loans)
- **Contradictions found:** None between guides. Several known API inconsistencies documented in API Contract Quirks.
- **Gaps noted:** API reference (endpoint schemas) not in this wiki. Rate limits and latency profile not documented in sources. Certification process details minimal.

---

## [2026-05-02] lint
- Issues found: 7
- Auto-fixed:
  - overview.md: typo "Changest" → "Changeset" (line 62)
  - index.md: page count corrected 46 → 54; source count corrected 27 → 25
  - analyses/swagger-api-inventory.md: added missing `related:` frontmatter field
  - analyses/missing-guides.md: added missing `related:` frontmatter field
  - concepts/lock-management-overview.md: added `[[Lock Desk]]` inline link (entity was orphaned by [[]] metric)
  - concepts/float-management.md: changed `[[Lock Management — Overview]]` to `[[Lock Management Overview]]` (em-dash in link title inconsistent with other references)
- Needs human review:
  - `[[Lock Cancellation and Reset]]` links in lock-management-overview.md (×2) resolve by H1 title in Obsidian but not by filename; file is lock-cancel-reset.md — acceptable in Obsidian, flag if migrating to other renderer
  - 12 source pages have zero inbound `[[]]` links (by design — sources are terminal nodes referenced via frontmatter `sources:` arrays); acceptable per schema
  - Float Down workflow has no dedicated concept page; mentioned in 13+ places; recommended new page: concepts/float-down-workflow.md
  - Webhook event catalog dated January 23, 2026; may be stale; `GET /api/v2/event-types/` is authoritative

---

## [2026-05-02] ingest | Swagger spec — 2026_04_26_swagger.json (OpenAPI 3.0.3, Polly API v2.0.0)
- Sources: raw/2026_04_26_swagger.json (35,790 lines, 1.3MB)
- **New pages (6):**
  - wiki/concepts/float-management.md — Float Management API (3 endpoints, entirely absent from all guides)
  - wiki/concepts/lock-extension.md — Lock extension workflow with isPreview mode and fee structure
  - wiki/concepts/price-exception-workflow.md — Full price exception API: submit, preview, attachments, approver/requestor group management, approve/deny
  - wiki/concepts/lock-cancel-reset.md — Lock cancellation vs reset distinction, post-cancellation relock path
  - wiki/analyses/swagger-api-inventory.md — Complete endpoint catalog: 19 tags, ~110 endpoints, organized by tag
  - wiki/analyses/missing-guides.md — 14 prioritized documentation gaps and recommended new guides
- **Updated pages (4):**
  - wiki/concepts/api-contract-quirks.md — Added 7 new issues from swagger analysis: string-encoded decimals, dual lock-policies endpoints with conflicting enums, `requestAndApprove` admin override, `allowExpiredResult`, `type` casing mismatch in price exception, lock request action enum completeness, readme.io title-only field suppression
  - wiki/concepts/lock-management-overview.md — Added approve/deny API, lock request notes, preapproval intercept, lock request history schema, updated lock actions table to reference new concept pages
  - wiki/entities/polly-loan-service.md — Added full CreateLoanRequest field reference table with Borrower and Property sub-schemas; documented string-encoded decimal pattern
  - wiki/index.md — Updated stats (38 → 46 pages), added all new pages
- **Key additions:**
  - Float Management tag (3 endpoints) confirmed completely absent from all developer hub guides
  - Discovered two overlapping lock-policies endpoints with inconsistent lockAction enum conventions (PascalCase vs camelCase)
  - `requestAndApprove` admin override present on 8 lock action endpoints, never documented
  - Preapproval intercept endpoint documented — distinct from Polly's built-in lock validation workflow
  - Lock request `action` enum documented in full: LOCK, REPRICE, EXTENSION, RELOCK, CANCEL, FLOAT_DOWN, PRODUCT_CHANGE, PRICE_EXCEPTION, RESET
  - Loan Service CreateLoanRequest field catalog added: 70 top-level fields, 30+ borrower fields, 25+ property fields
- **Contradictions found:** None between spec and existing guides.
- **Gaps noted:** Configuration: Users guide missing. Exchange co-issuer endpoint undocumented. Dynamic pricing detail endpoint undocumented. Several schema descriptions missing (Readme suppresses ~700-1000 title-only fields).
