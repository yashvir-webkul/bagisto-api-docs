---
outline: false
examples:
  - id: get-storefront-features
    title: Get Storefront Features
    description: Which optional features this channel has switched on, so the storefront knows what to render.
    request: |
      GET /api/shop/features
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
    response: |
      [
        {
          "id": "default",
          "channel": "default",
          "gdpr": true,
          "euWithdrawal": false
        }
      ]
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# Get Storefront Features

Which optional features the store has switched on for this channel. Read it once when the storefront boots, so the account area can hide what the store does not offer instead of showing a link that answers with an error.

## Endpoint

```
GET /api/shop/features
```

## Authentication

Public — send the storefront key. No customer token is needed, so this can be read before anyone logs in. See the [Authentication](/api/rest-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Channel code, which identifies this flag set. |
| `channel` | string | Channel the flags were read for. |
| `gdpr` | boolean | Whether customers may raise GDPR data requests. |
| `euWithdrawal` | boolean | Whether the EU right-of-withdrawal form is offered on orders. |

Both flags are read per channel, so a store that enables a feature on one channel only reports it on that channel.

## What Each Flag Gates

- **`gdpr`** — when `false`, [GDPR Requests](/api/rest-api/shop/gdpr-requests/) refuse with `400`. Hide the data-request screens rather than letting a customer submit into an error.
- **`euWithdrawal`** — when `false`, the withdrawal endpoints refuse the same way. The flag is per channel, so check it for the channel the customer is shopping.

## Returns Are Not Listed Here

Bagisto has no master switch for returns, so there is nothing honest to report as a boolean. Whether a customer can return anything is answered per order instead: call [List Returnable Orders](/api/rest-api/shop/returns/list-returnable-orders) and show the Returns area when it comes back non-empty. That also reflects the return window and the product types the store allows, which a single flag could not.

## Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | The flags for the current channel. |
| `401 Unauthorized` | Missing or invalid storefront key. |

## Related Resources

- [GDPR Requests](/api/rest-api/shop/gdpr-requests/) — gated by `gdpr`
- [List Returnable Orders](/api/rest-api/shop/returns/list-returnable-orders) — whether returns are available to this customer
- [Get Theme](/api/rest-api/shop/theme/) — the theme the channel runs
