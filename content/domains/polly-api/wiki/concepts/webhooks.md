---
title: Webhooks
type: concept
tags: [webhooks, events, cloudevents, notifications, subscription]
created: 2026-05-02
updated: 2026-05-02
sources: [webhook-overview.md, webhook-notification-payload.md, webhook-retries.md, configuring-webhook-security.md, concepts-and-considerations.md]
related: [wiki/concepts/webhook-security.md, wiki/concepts/lock-management-overview.md, wiki/concepts/real-time-actions.md, wiki/concepts/integration-patterns.md, wiki/entities/polly-loan-service.md]
---

# Webhooks

Polly's webhook system delivers real-time event notifications via HTTP POST to registered endpoints. Subscriptions, security, and notification history are all self-managed by the integration partner via API — no Polly involvement required after initial org-level enablement.

---

## Why webhooks over polling

Polling requires your system to repeatedly call Polly on a fixed interval to check for changes. This creates unnecessary API traffic, delayed awareness of state changes, and potential timing gaps. Webhooks eliminate all of this. Polly does not offer a mechanism to resend failed events, making reliable webhook handling especially important.

---

## Payload format — CloudEvents 1.0

All events use the CloudEvents 1.0 spec:

```json
{
  "id": "395274de-c61f-40e7-8674-11b915842dcf",
  "specversion": "1.0",
  "time": "2024-11-18T23:47:53.457494Z",
  "type": "com.pollyex.lock.initialLockRequestApproved",
  "source": "urn:uuid:f3879be5-4969-4afa-8a6e-7e7df0131f68",
  "datacontenttype": "application/json",
  "data": {
    "resource": "lock",
    "resourceId": "113546",
    "loanId": "b0681913-3c44-42c4-8b6e-f1bbf423e71",
    "orgTicker": "AJCU"
  }
}
```

The `data` payload contains only enough to identify the resource. It contains **no PII**. Use the `resourceId` to call the appropriate API for full details.

`id` = notification identifier, usable for deduplication and log lookup.

---

## Subscription management

**Get subscribable events:** `GET /api/v2/event-types/?isActive=true`  
**Create subscription:** `POST /api/v2/webhooks/`  
**Manage subscriptions:** Configuration: Webhooks API section

At a minimum, create a subscription for the events you plan to consume. Webhooks only fire for active subscriptions.

---

## Important behaviors

- **Webhooks fire after write-back.** Lock events fire only after Polly has written data back to the Loan Service. If you see no event in the notification log, a write-back failure may be the cause.
- **Delivery order is not guaranteed.** Events fire in order internally but may arrive out of order. Design your handler to be idempotent.
- **No resend mechanism.** Polly cannot resend failed events via the UI. Self-diagnose via the `webhook-notifications` API.
- **Deleting a subscription deletes its event history** from the notifications endpoint.
- **Concurrent lock + exception events**: Submitted events fire immediately; approval/denial events are held until both actions are decisioned.

---

## Full event catalog (as of January 23, 2026)

See `GET /api/v2/event-types/` for the authoritative live list.

### Lock events

| Event | Trigger |
|---|---|
| `lock.initialLockRequestSubmitted` | Initial lock submitted via UI or API |
| `lock.initialLockRequestApproved` | Approved (auto or manual) |
| `lock.initialLockRequestDenied` | Denied by Lock Desk |
| `lock.pendingLockRequestCancelled` | Pending lock cancelled |
| `lock.repriceLockRequestSubmitted/Approved/Denied` | Reprice workflow |
| `lock.relockRequestSubmitted/Approved/Denied` | Relock workflow |
| `lock.productChangeRequestSubmitted/Approved/Denied` | Product change workflow |
| `lock.priceExceptionRequestSubmitted/Approved/Denied` | Price exception workflow |
| `lock.floatDownRequestSubmitted/Approved/Denied` | Float down workflow |
| `lock.lockExtensionRequestSubmitted/Approved/Denied` | Lock extension workflow |
| `lock.lockCancellationRequestSubmitted/Approved/Denied` | Cancellation workflow |
| `lock.confirmationDocumentGenerated` | Lock confirmation PDF ready |
| `lock.lockActionPendingApproval` | Lock pre-validation hook (see [[Lock Validation Workflow]]) |
| `lock.autoRepriceLockAutoCancelled` | Pending lock cancelled by auto-reprice |
| `lock.autoRepriceNoPricingChangeNoActionRequired` | Auto-reprice, no price change |
| `lock.autoRepricePricingChangedNoActionRequired` | Auto-reprice, price changed, auto-approved |
| `lock.SellSideManuallyUpdated` | Lock Desk manually updated sell-side fields |
| `lock.pendingLockSellSideAnalysisExecuted` | Lock Desk ran sell-side analysis |

### Loan events

| Event | Trigger |
|---|---|
| `loan.actionRequired` | Real-time actions required (Loan Service only) |
| `loan.committedCoIssuer` | Loan committed on Polly Loan Exchange |

### Changeset events

| Event | Trigger |
|---|---|
| `changeset.newVersionPublishedAutomatically` | Automatic publish (e.g., daily ratesheet) |
| `changeset.newVersionPublishedManually` | Manual publish (rules, products, params changed) |

### Custom parameter events

| Event | Trigger |
|---|---|
| `customParameter.addedCustomParameter` | New parameter added to a changeset |
| `customParameter.updatedCustomParameter` | Parameter updated |
| `customParameter.deletedCustomParameter` | Parameter deleted |

### MI events

| Event | Trigger |
|---|---|
| `mi.quotesGeneratedViaUI` | MI quotes requested via Polly UI |
| `mi.quotesGeneratedViaAPI` | MI quotes requested via API |
| `mi.quoteSelectedViaUI` | Specific MI quote linked to loan via UI |

### Other events

| Event | Trigger |
|---|---|
| `float.floatRequestSubmitted` | Float request submitted (no approval needed) |
| `quote.rateQuotesGenerated` | Rate quotes generated in Scenario Mode |
| `batch.batchCompleted` | Batch pricing job finished |
| `rateAlert.rateAlertSatisfied` | Desired rate/price became available |
| `rateAlert.rateAlertSetupViaUI` | Rate alert set up via UI |
| `rateSheets.rateSheetGenerated` | Rate sheet generated |

---

## Triage and debugging

**Self-service:** `GET /api/v2/webhook-notifications/` returns every webhook sent, with status codes and delivery attempts. Providing a way for your support team to access this API can significantly reduce Polly support requests.

**OAuth failures:** Show as `OAUTH2_FAILURE` in the notifications API without the HTTP response code — requires Polly to investigate. HMAC is easier to self-diagnose. See [[Webhook Security]].

**Source IP whitelisting:** Available on request per environment. Contact Polly integration team.

---

## Webhook retry policy

See [[Webhook Security]] for retry behavior details: retries on 429, 502, 504 (up to 5 attempts, exponential backoff). Subscription disabled on 3xx or 410.

**Best practice:** Acknowledge receipt (2xx) immediately. Queue the payload for async processing. Do not perform database writes or downstream API calls before responding — timeouts cause unnecessary retries.
