---
title: "Source: Pricing Using Batch APIs"
type: source
tags: [batch, pricing, sftp, csv]
created: 2026-05-02
updated: 2026-05-02
sources: [pricing-using-our-batch-apis.md]
related: [wiki/concepts/batch-pricing.md]
---

# Source: Pricing Using Batch APIs

**File:** `raw/devhub-guides/pricing-using-our-batch-apis.md`

## Summary

Workflow guide for batch pricing via SFTP + API. Covers CSV format, SFTP upload, batch job initiation, status polling, webhook option, response CSV download, and parsing. Revision 8.

## Key claims

- CSV quote character: single quote `'` (not double quote)
- Request CSV: 2 columns (`requestId`, `requestPayload`); one pricing scenario JSON per row
- SFTP host: `sftp.pollyex.com`; upload to `~/batchrequest/`
- Response files chunked at 5,000 rows
- Ineligible products NOT included in batch output
- Response filename: `<orgId>_<datetime>_response<batchId>_<chunkId>.csv`

## What this updates in the wiki

- Primary source for [[Batch Pricing]]
