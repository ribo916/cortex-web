---
title: Batch Pricing
type: concept
tags: [batch, pricing, sftp, csv]
created: 2026-05-02
updated: 2026-05-02
sources: [pricing-using-our-batch-apis.md]
related: [wiki/concepts/pricing-scenario.md, wiki/concepts/webhooks.md, wiki/concepts/integration-patterns.md, wiki/concepts/api-contract-quirks.md]
---

# Batch Pricing

Batch pricing allows submitting hundreds of pricing scenario requests at once via a CSV file uploaded to SFTP, rather than making individual API calls. The request/response structure mirrors the standard pricing scenario API — same data, same capabilities.

**Use case:** High-volume pricing workflows such as lead generation, ratesheet generation, portfolio analysis, or any scenario where many loans need to be priced simultaneously.

---

## Workflow

```
1. Build request CSV  →  2. Upload to SFTP  →  3. POST batch job
4. Wait (webhook or poll)  →  5. Download response CSV  →  6. Parse results
```

---

## Step 1: Build the request CSV

- 2 columns: `requestId`, `requestPayload`
- Delimiter: comma `,`
- Quote character: **single quote `'`** (not double quote — see [[API Contract Quirks]])
- One pricing scenario JSON payload per row
- The JSON payload per row is identical to `POST /pe/pricing-scenarios/` request body

```
'myRequestId1','{"audienceId":"...","borrower":{...},"loan":{...},...}'
'myRequestId2','{"audienceId":"...","borrower":{...},"loan":{...},...}'
```

---

## Step 2: Upload to SFTP

- Host: `sftp.pollyex.com`
- Credentials provided by Polly
- Create folder `batchrequest` under root if it doesn't exist
- Upload to `~/batchrequest/<filename>.csv`

---

## Step 3: Start the batch job

`POST /api/v2/pe/batch-pricing`

```json
{ "requestFileLocation": "~/batchrequest/<filename>.csv" }
```

Response includes `monitoringUrl` (which contains the `batchId` for status polling).

---

## Step 4: Wait for completion

**Option A — Webhook (recommended):**
Subscribe to `batch.batchCompleted` before submitting. The event fires when the job finishes; use the included `batchId` to call Step 5.

**Option B — Poll:**
`GET /api/v2/pe/batch-pricing/{batchId}`

```json
{
  "batchId": "...",
  "status": "SUCCEEDED",
  "result": {
    "rowsRequested": 500,
    "rowsCompleted": 500,
    "responseFilesLocation": ["~/batchrequest/..."]
  }
}
```

Poll until `status == "SUCCEEDED"`.

---

## Step 5: Download response CSV

Once status is `SUCCEEDED`, download from the paths in `result.responseFilesLocation` via SFTP.

Output file naming: `<organizationId>_<datetime>_response<batchId>_<chunkId>.csv`

**Chunks:** Output is split into chunks of 5,000 rows to enable parallel processing. A 12,000-row input produces 3 output CSV files.

---

## Step 6: Parse the response CSV

- 2 columns: `requestId`, `responsePayload`
- Each response payload is the standard pricing scenario API response for that row
- Ineligible products are **not included** in batch responses (unlike the standard API with `returnIneligibleProducts: true`)

---

## Key notes

- The single-quote CSV format is intentional — API response data contains characters requiring escaping
- Batch and standard pricing API are functionally identical; batch just handles the transport layer
- Ineligible products are excluded from batch output regardless of settings
