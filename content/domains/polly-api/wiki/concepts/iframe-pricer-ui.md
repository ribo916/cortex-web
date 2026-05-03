---
title: iFrame Pricer UI
type: concept
tags: [iframe, pricer-ui, portal, scenario-mode, lock-mode, channels]
created: 2026-05-02
updated: 2026-05-02
sources: [iframing-polly-pricer-ui.md, concepts-and-considerations.md, generate-quotes.md]
related: [wiki/concepts/integration-patterns.md, wiki/concepts/authentication.md, wiki/concepts/lock-management-overview.md, wiki/concepts/custom-parameters.md, wiki/concepts/quote-generation.md, wiki/entities/polly-loan-service.md]
---

# iFrame Pricer UI

The Polly Pricer UI is Polly's hosted web interface, embeddable in any application via iFrame. It handles the full pricing and lock UX, including price exceptions, Float Down, concurrent lock + exception, Lock Desk workflows, and worst-case pricing logic — significantly reducing integration effort for complex lock workflows.

---

## Launch flow (3 steps)

```
1. POST /api/v2/auth/token          → Bearer token (API user)
2. POST /api/v2/pe/portal-authentication  → portalLoginToken (one-time use, 5 min TTL)
3. Open URL: https://lx.pollyex.com/partner/api/v1/pe/portal/get_session/
             ?portalLoginToken={token}&orgTicker={org}
```

The URL in Step 3 is opened directly in a browser or iFrame — it is not an API call and is not in the API reference.

---

## Portal token details

- **Single-use** — attempting to reuse returns HTTP 500
- **5-minute expiry**
- Requesting a new token does not invalidate a previous one
- The `username` parameter is the **Polly portal user's username**, not the API user's username — these may differ (see [[API Contract Quirks]])

---

## Launch modes

| Mode | Trigger | Use case |
|---|---|---|
| **Scenario Mode** | Launch without `loanId` | Rate shopping, quote generation, exploratory pricing — no loan associated |
| **Lock Mode** | Launch with `loanId` | Full lock workflow associated with a specific loan in the Loan Service |

---

## URL parameters (Step 3)

| Parameter | Required | Description |
|---|---|---|
| `portalLoginToken` | Yes | Authentication token from Step 2 |
| `orgTicker` | No | Organization identifier; defaults to user's preference or lowest org ID |
| `audienceId` | No | Sets the default channel on load (does not restrict the user) |
| `loanId` | No | If provided, launches in Lock Mode for that loan |
| `quoteScenarioId` | No | Loads a previously created quote scenario; cannot combine with `loanId` or `peRequestId` |
| `peRequestId` | No | Loads a previously executed pricing scenario; cannot combine with `loanId` or `quoteScenarioId` |
| `companyName` | No | Encompass TPO only: company name for TPO Connect redirect |
| `tpoUserId` | No | Encompass TPO only: TPO user ID for TPO Connect redirect |

---

## Users and channels

**The portal user determines what the iFrame shows.** The `username` in Step 2 identifies the Loan Officer who will be logged into the iFrame session. Their Polly permissions control:
- Which channels (rate sheet configurations) appear
- Which custom parameters are visible or defaulted
- Which parameter enumerations are available (Loan Officers can be restricted to specific values)

> A custom parameter the Loan Officer doesn't have access to resolves to `null` when loaded from the Loan Service — even if the value is on the loan record.

**Channel discovery endpoints:**
- `GET /api/v2/pe/users` — list all users (`id`, `username`, `email`, `roles`, `isActive`)
- `GET /api/v2/pe/users/{userId}` — single user details
- `GET /api/v2/pe/users/{userId}/channels` — channels the user is authorized for
- `GET /api/v2/pe/changesets/{changesetId}/channels` — all channels for a changeset

**`audienceId` behavior:** Passing `audienceId` sets the default channel on load. If the user doesn't have access to that channel, Polly falls back to the first authorized channel alphabetically. It does not restrict the user.

---

## Data sync requirements

**Before launch:** Update the Loan Service snapshot with current loan data. The iFrame loads with the snapshot data at launch time. Updates made to the LOS during an active iFrame session are not reflected.

**After lock events:** Receive webhook → call lock request API → call pricing scenario API → reconcile data back to LOS. The iFrame does not push data back to your application directly — all post-lock data flows through webhooks + API calls.

---

## UI versions

Two UI versions exist, configurable per customer by Polly:
- **Legacy UI** — original look and feel
- **New UI** — enhanced, mobile-responsive

Feature availability differs: Float Down is available only in New UI. Certain new features will only be built in New UI going forward. The [[Lock Validation Workflow]] (pre-approval) also requires New UI.

There is no integration effort difference between versions, but features that only exist in New UI will not appear for Legacy UI customers.

---

## Troubleshooting

**Third-party cookies blocked:** The iFrame requires third-party cookies. Ensure they're enabled in the browser and hosting environment.

**Reused portalLoginToken:** Single-use token — HTTP 500 if reused. Generate a new one for each session.

**"Unable to authenticate" on token request:** Username mismatch. Confirm you're sending the Polly portal username, not the API username.

**No channels visible after launch:** The Loan Officer user has no channels assigned. Confirm channel access via the users/channels endpoint and have the org admin assign channels in Polly.

**TPO redirect issues:** Ensure `companyName` and `tpoUserId` are both provided for Encompass TPO users.
