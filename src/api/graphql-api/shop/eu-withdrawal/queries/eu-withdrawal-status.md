---
outline: false
examples:
  - id: eu-withdrawal-status
    title: EU Withdrawal Status
    description: Whether customers can file an EU withdrawal on the current channel.
    query: |
      query {
        euWithdrawalStatus {
          channel
          enabled
        }
      }
    response: |
      {
        "data": {
          "euWithdrawalStatus": {
            "channel": "default",
            "enabled": false
          }
        }
      }
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# EU Withdrawal Status

Tells you whether the store offers the EU right-of-withdrawal form on the current channel. Check it before showing the withdrawal option on orders.

## Authentication

Public — send the storefront key. No customer token is needed. See the [Authentication](/api/graphql-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `channel` | String | Channel the setting was read for. |
| `enabled` | Boolean | `true` when customers can file a withdrawal. The setting is per channel, so read it for the channel the customer is shopping. |

## Related Resources

- [File EU Withdrawal](/api/graphql-api/shop/eu-withdrawal/mutations/create-eu-withdrawal)
- [File EU Withdrawal (Guest)](/api/graphql-api/shop/eu-withdrawal/mutations/create-guest-eu-withdrawal)
