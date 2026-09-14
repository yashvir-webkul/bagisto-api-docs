---
outline: false
examples:
  - id: eu-withdrawal-status
    title: EU Withdrawal Status
    description: Whether customers can file an EU withdrawal on the current channel.
    request: |
      GET /api/shop/eu-withdrawal-status
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
    response: |
      [
        {
          "id": "default",
          "channel": "default",
          "enabled": false
        }
      ]
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# EU Withdrawal Status

Tells you whether the store offers the EU right-of-withdrawal form on the current channel. Check it before showing the withdrawal option on orders.

## Endpoint

```
GET /api/shop/eu-withdrawal-status
```

## Authentication

Public — send the storefront key. No customer token is needed. See the [Authentication](/api/rest-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Channel code. |
| `channel` | string | Channel the setting was read for. |
| `enabled` | boolean | `true` when customers can file a withdrawal. The setting is per channel, so read it for the channel the customer is shopping. |

## Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | The EU withdrawal setting of the current channel. |
| `401 Unauthorized` | Missing or invalid storefront key. |

## Related Resources

- [File EU Withdrawal](/api/rest-api/shop/eu-withdrawal/create-eu-withdrawal)
- [File EU Withdrawal (Guest)](/api/rest-api/shop/eu-withdrawal/create-guest-eu-withdrawal)
