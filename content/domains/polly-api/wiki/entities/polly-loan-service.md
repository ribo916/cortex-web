---
title: Polly Loan Service
type: entity
tags: [loan-service, los, snapshot, integration]
created: 2026-05-02
updated: 2026-05-02
sources: [polly-loan-service-overview.md, concepts-and-considerations.md]
related: [wiki/concepts/integration-patterns.md, wiki/concepts/custom-parameters.md, wiki/concepts/real-time-actions.md, wiki/entities/native-los-integrations.md, wiki/concepts/lock-management-overview.md]
---

# Polly Loan Service

The Polly Loan Service is a **snapshot repository** for loan data used in integrations where Polly does not have a direct native connection to the LOS. It is the integration layer that enables non-native LOS providers to use Polly's pricing and lock management APIs.

---

## What it is and isn't

**It is:**
- A mutable snapshot of loan data, maintained by the integration partner
- The data source Polly uses for pricing and eligibility when launching the iFrame or running loan-scoped pricing calls
- An integration responsibility layer

**It is NOT:**
- The system of record or source of truth
- A replacement for the LOS
- A long-term data warehouse
- Available for native LOS integrations (Encompass, MeridianLink, Byte, Mortgage Director)

Think of it as: *a snapshot of loan data Polly uses during pricing when it cannot directly access the LOS.*

---

## When it applies

| Integration type | Loan Service required? |
|---|---|
| Encompass, MeridianLink, Byte, Mortgage Director | No — Polly has direct read/write |
| Any other LOS | Yes |
| POS with customer on native LOS | Usually no — depends on workflow |
| CRM / Marketing / Lead Gen | No |

---

## API sections

**Loan Management** (`/api/v2/loans/`): 6 calls — retrieve all, create, retrieve by ID, update (PUT/PATCH), delete.

**Configuration: Loan Management** (`/api/v2/custom-parameters/`): Manages custom parameters within the Loan Service itself. Note path prefix: `/api/v2/custom-parameters/` (no `pe/`). See [[Custom Parameters]] for why you should prefer the Pricing Engine API (`/api/v2/pe/custom-parameters/`) over this for parameter definitions.

---

## Field reference — `CreateLoanRequest`

The loan schema has ~70 top-level fields. Required fields include many that are also nullable — send `null` if your LOS doesn't have the value. All financial values are string-encoded decimals (not `number` type).

### Top-level required fields

| Field | Type | Notes |
|---|---|---|
| `losLoanId` | string | Operational ID used in all API paths |
| `loanNumber` | string | Display-friendly ID shown in Polly UI |
| `borrower` | object | See Borrower sub-schema below |
| `loanofficer` | object | LO assignment |
| `property` | object | See Property sub-schema below |
| `customValues` | object (nullable) | Custom parameter values |
| `externalCreatedAt` | string | ISO 8601 — when loan was created in LOS |
| `externalModifiedAt` | string | ISO 8601 — when loan was last modified in LOS |
| `purpose` | string enum | `NONE`, `PURCHASE`, `REFINANCE`, `CONSTRUCTION`, `CONSTRUCTION_PERM` |
| `amount` | string | Loan amount (string-encoded decimal) |
| `loanTerm` | integer (nullable) | Term in months |
| `loanType` | string enum (nullable) | `NONE`, `CONVENTIONAL`, `FHA`, `VA`, `USDA` |
| `amortizationType` | string enum (nullable) | `NONE`, `FIXED`, `ARM`, `BALLOON`, `OPTION_ARM` |
| `ltv` | string | Loan-to-value ratio |
| `cltv` | string | Combined LTV |
| `hcltv` | string | High combined LTV |
| `aus` | string enum (nullable) | `NONE`, `MANUAL`, `DU`, `LP`, `OTHER` |
| `propertyValue` | string | Appraised or estimated value |
| `purchasePrice` | string (nullable) | Required for purchase loans |
| `cashOutAmount` | string (nullable) | Cash-out for refinances |
| `documentationType` | string enum (nullable) | `STREAMLINE_REFINANCE`, `FULL_DOCUMENTATION` |
| `refinancePurpose` | string enum (nullable) | `NONE`, `NO_CASH_OUT`, `CASH_OUT`, `LIMITED_CASH_OUT`, `HOME_IMPROVEMENT` |
| `impoundType` | string enum (nullable) | `NONE`, `PARTIAL`, `FULL` |
| `lenderFee` | string (nullable) | |
| `rollLenderFee` | boolean (nullable) | |
| `position` | string enum (nullable) | `FIRST`, `SECOND`, `HELOC`, `THIRD` |
| `secondAmount` | string (nullable) | Second mortgage amount |
| `productCode` | string (nullable) | Product code at time of loan creation |
| `productName` | string (nullable) | Product name |
| `rate` | string (nullable) | Rate at time of loan creation |
| `temporaryBuydownType` | string enum (nullable) | `NONE`, `THREE_TWO_ONE`, `TWO_ONE`, `ONE_ONE`, `ONE_ZERO` |
| `prepaymentPenaltyPeriodMonths` | integer (nullable) | |

### Government loan fields (optional, loan-type dependent)

| Field | Type | Notes |
|---|---|---|
| `fhaTotalLoanAmount` | string (nullable) | Updated by Polly on persist |
| `fhaMortgageInsurancePremiumPercentage` | string (nullable) | |
| `fhaMortgageInsurancePremiumAmount` | string (nullable) | |
| `fhaTltv` | string (nullable) | |
| `fhaFinancingOption` | string enum (nullable) | `FINANCE`, `PAID_IN_CASH` |
| `fhaCaseAssignmentDate` | string (nullable) | FHA Case Number Assignment Date |
| `vaTotalLoanAmount` | string (nullable) | Updated by Polly on persist |
| `vaFundingFeeAmount` | string (nullable) | |
| `vaCashFundingFeeAmount` | string (nullable) | |
| `vaFundingFeePercentage` | string (nullable) | |
| `vaFinancedAmount` | string (nullable) | |
| `vaFinancingOption` | string enum (nullable) | `FINANCE`, `PAID_IN_CASH` |
| `isVaFundingFeeExempt` | boolean (nullable) | |
| `vaLoanHistory` | string enum (nullable) | `FIRST_USE`, `REPEAT_USE` |
| `vaDownPaymentAmount` | string (nullable) | |
| `vaTltv` | string (nullable) | |
| `usdaTotalLoanAmount` | string (nullable) | Updated by Polly on persist |
| `usdaGuaranteedPercentage` | string (nullable) | |
| `usdaGuaranteeFeeAmount` | string (nullable) | |
| `usdaFinancedAmount` | string (nullable) | |
| `usdaFinancingOption` | string enum (nullable) | `FINANCE`, `PAID_IN_CASH` |
| `usdaTltv` | string (nullable) | |

### Borrower sub-schema (`CreateBorrowerRequest`)

| Field | Type | Notes |
|---|---|---|
| `firstName`, `lastName` | string | |
| `fico` | integer | Credit score |
| `dtiRatio` | string | |
| `verificationMethod` | string enum | `NONE`, `FULL`, `BANK_STATEMENT`, `VOE`, `W2_ONLY`, `1099` (updated April 2026) |
| `incomeDocumentation` | string enum | `NONE`, `STATED`, `VERIFIED` |
| `incomeMonthly` | integer | |
| `employmentVerification` | string enum | `NONE`, `STATED`, `VERIFIED` |
| `assetDocumentation` | string enum | `NONE`, `STATED`, `VERIFIED` |
| `assetDepletionAmount`, `assetUtilizationAmount`, `assetQualificationAmount` | string | |
| `isFirstTimeHomeBuyer`, `isSelfEmployed`, `isNonOccupancyBuyer` | boolean | |
| `isGiftFunds`, `multipleBorrowerPairs`, `isNonTraditionalCredit` | boolean | |
| `isNonOccupancyCoborrower` | boolean | |
| `citizenship` | string enum | `NONE`, `FOREIGN_NATIONAL`, `NON_PERMANENT_RESIDENT`, ... |
| `creditGrade` | string enum | `NONE`, `AAA`, `AA`, `A_PLUS`, `A`, `A_MINUS`, ... |
| `monthsOfReserves` | integer | |
| `propertiesOwned` | integer | |
| `debtServiceCoverageRatio` | string | |
| `residualIncome` | number | |
| `derogatoryEvents` | object | Nested object for derogatory event flags |
| `isITIN` | boolean | Individual Taxpayer Identification Number |
| `entityType` | string enum | `None`, `Corporation`, `Individual`, `LLC`, ... |
| `bankStatementsNumberOfMonthsPersonal` | integer | |
| `months1099`, `cpaPandLMonths`, `fullDocMonths` | integer | |

### Property sub-schema (`CreatePropertyRequest`)

| Field | Type | Notes |
|---|---|---|
| `addressLine1`, `addressLine2` | string | Street address |
| `city`, `county`, `state` | string | State is 2-letter code enum (all US states + territories) |
| `zipCode` | string | |
| `zipCodePlusFour` | string | |
| `countyFipsCode`, `countyFipsCodeOnly` | string | FIPS codes |
| `stateFipsCode` | string | |
| `occupancy` | string enum | `NONE`, `PRIMARY`, `SECONDARY`, `INVESTMENT` |
| `propertyType` | string enum | `NONE`, `SFR`, `CONDO`, `PUD`, `MOBILE`, `TWO_UNIT`, `THREE_UNIT`, `FOUR_UNIT`, `MANUFACTURED`, `MIXED_USE` |
| `propertyAttachmentType` | string enum | `UNSPECIFIED`, `ATTACHED`, `DETACHED` |
| `appraisedValue`, `estimatedValue` | string | |
| `units`, `stories` | integer | |
| `isCondotel`, `isNonWarrantableProject` | boolean | |
| `isDecliningMarket`, `isHighCostCounty` | boolean | |
| `isShortTermRental`, `isRuralProperty` | boolean | |
| `inspectionWaiver` | boolean | |
| `lotSizeInAcres` | string | |
| `msaCode`, `censusTract` | string | MSA and Census Tract codes |
| `medianIncome` | string | |

---

## Loan IDs

When creating a loan, the integration partner provides two IDs:
- `loanNumber` — display-friendly, shown in Polly UI
- `losLoanId` — the operational ID used in all API paths and visible in Polly UI URLs. This is what you use everywhere.

The `id` returned in the CreateLoan response is Polly's internal ID and is not used in any subsequent API calls.

---

## Data integrity responsibilities

Because Polly cannot write back to the LOS directly, the integration partner owns data synchronization:

1. **Before pricing/locking:** Ensure the loan snapshot is current. The snapshot is the data Polly uses — stale data produces stale pricing.
2. **After lock events:** Receive the webhook, then pull lock details + pricing response, then reconcile back to the LOS.
3. **During iFrame sessions:** Data updated in the LOS during an active iFrame session is not reflected — the iFrame loads with snapshot data at launch time.
4. **On locked loans:** Modifying the LOS while a lock is pending or active can invalidate it. Have a strategy before writing back.

> Best practice: Reconcile data from the pricing response, not from `GET /loans/{losLoanId}`. The pricing response shows exactly what data was used during the pricing phase.

---

## Single borrower object limitation

Polly's loan schema has a single borrower object. LOS platforms typically support multiple borrowers. Integration partners must define with their customer how multi-borrower scenarios map to Polly's single borrower. This has downstream eligibility implications — for example, a foreign national co-borrower on an FHA loan could be missed if the primary borrower is mapped 1:1 without accounting for the co-borrower's attributes.

---

## Real-Time Actions

An optional org-level configuration. When enabled, any PUT/PATCH to the Loan Service on a locked loan triggers an automatic reprice. This can significantly complicate integrations that update the loan frequently. See [[Real-Time Actions]] for the full decision matrix.

---

## Data reconciliation flow

After a lock event:
1. Receive webhook (e.g., `lock.initialLockRequestApproved`)
2. Call `GET /pe/loans/{loanId}/lock-requests/{lockRequestId}` to retrieve lock details + `peRequestId`
3. Call `GET /pe/pricing-scenarios/{peRequestId}` to get the full pricing response with all data used
4. Map pricing response schema → LOS schema and write back

Note: The pricing response schema is similar to, but not identical to, the create loan schema. Budget a mapping effort.
