---
title: MI Quotes
type: concept
tags: [mi, mortgage-insurance, quotes, rate-cards]
created: 2026-05-02
updated: 2026-05-02
sources: [mi-quotes-1.md, concepts-and-considerations.md]
related: [wiki/concepts/pricing-scenario.md, wiki/concepts/webhooks.md, wiki/concepts/iframe-pricer-ui.md, wiki/concepts/integration-patterns.md]
---

# MI Quotes

Polly supports Mortgage Insurance (MI) calculations via two distinct paths depending on how the customer has configured their Polly org: **Direct Quoting** and **Rate Cards**. These are not interchangeable — the right approach depends entirely on the customer's configuration.

---

## Common misconception

> Integration partners building MI Quote API integrations may miss Rate Card customers — when a new Rate Card–configured customer launches, MI data comes back in the pricing scenario response directly, not via MI Quotes API. This has caused confusion for partners who assumed all customers use Direct Quoting.

Always clarify with each customer which MI path they use before building the integration.

---

## Path 1: Direct Quoting

Polly sends a real-time request to the customer's configured MI providers when a Conventional loan's LTV exceeds 80%. Results are sorted by best execution time.

### Via Polly UI / iFrame

1. User requests MI quotes in the Pricer UI
2. Polly requests quotes from all configured providers
3. User selects a quote ("float" or "lock" click links it to the loan)
4. `mi.quoteSelectedViaUI` webhook fires → call `GET /api/v2/mi-quotes/{miRequestId}/selection` to retrieve the selected quote
5. Optional: subscribe to `mi.quotesGeneratedViaUI` to receive notification when quotes are ready → call `GET /api/v2/mi-quotes/` for all quote details

### Via API (headless)

1. `POST /api/v2/mi-quotes/` — submits an MI quote request to all configured providers
2. Subscribe to `mi.quotesGeneratedViaAPI` (or poll)
3. `GET /api/v2/mi-quotes/` — retrieve quote results

MI data from Direct Quoting is **not** part of the pricing scenario response — it requires separate API calls.

### MI data in rate quotes (Generate Quotes flow)

When using the Quote Generation flow, the rate quote response includes `miRequestId` per rate/product combo (added in Release 116). Use this with `GET /api/v2/mi-quotes/{miRequestId}/selection` to retrieve the associated MI quote.

---

## Path 2: Rate Cards

Some customers use static MI rate cards configured within Polly's pricing engine. MI is treated as a pricing component, not a real-time third-party request.

When a loan meets the MI qualification criteria, MI premium is calculated automatically and included in the pricing scenario response under:

```
$.data.results[x].mortgageInsuranceResult
```

No separate MI Quote API calls are needed. No `mi.*` webhooks fire for rate card customers.

---

## Webhook events

| Event | When |
|---|---|
| `mi.quotesGeneratedViaUI` | Quotes requested via Polly UI |
| `mi.quotesGeneratedViaAPI` | Quotes requested via API |
| `mi.quoteSelectedViaUI` | User links a specific quote to the loan via UI |

`mi.quoteSelectedViaUI` fires at the moment the user clicks "float" or "lock" after selecting an MI quote. Only fires when a loan application exists (not for Scenario Mode without a loan).
