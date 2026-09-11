---
outline: false
examples:
  - id: storefront-feature
    title: Storefront Features
    description: Which optional features this channel has switched on, so the storefront knows what to render.
    query: |
      query {
        storefrontFeature {
          channel
          gdpr
          euWithdrawal
        }
      }
    response: |
      {
        "data": {
          "storefrontFeature": {
            "channel": "default",
            "gdpr": true,
            "euWithdrawal": false
          }
        }
      }
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# Storefront Features

Which optional features the store has switched on for this channel. Read it once when the storefront boots, so the account area can hide what the store does not offer instead of showing a link that answers with an error.

## Authentication

Public — send the storefront key. No customer token is needed, so this can be read before anyone logs in. See the [Authentication](/api/graphql-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `channel` | String | Channel the flags were read for. |
| `gdpr` | Boolean | Whether customers may raise GDPR data requests. |
| `euWithdrawal` | Boolean | Whether the EU right-of-withdrawal form is offered on orders. |

Both flags are read per channel, so a store that enables a feature on one channel only reports it on that channel.

Selecting `id` returns this resource's IRI rather than the channel code — select `channel` for the code.

## What Each Flag Gates

- **`gdpr`** — when `false`, the GDPR request operations refuse with an error. Hide the data-request screens rather than letting a customer submit into one.
- **`euWithdrawal`** — when `false`, the withdrawal operations refuse the same way. The flag is per channel, so check it for the channel the customer is shopping.

## Returns Are Not Listed Here

Bagisto has no master switch for returns, so there is nothing honest to report as a boolean. Whether a customer can return anything is answered per order instead: query `returnableOrders` and show the Returns area when it comes back non-empty. That also reflects the return window and the product types the store allows, which a single flag could not.

## Related Resources

- [List Returnable Orders](/api/graphql-api/shop/returns/queries/list-returnable-orders) — whether returns are available to this customer
- [Theme](/api/graphql-api/shop/theme/) — the theme the channel runs
