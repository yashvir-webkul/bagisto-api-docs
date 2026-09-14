---
outline: false
examples:
  - id: gdpr-status
    title: GDPR Status
    description: Whether customers can raise GDPR data requests on the current channel.
    query: |
      query {
        gdprStatus {
          channel
          enabled
        }
      }
    response: |
      {
        "data": {
          "gdprStatus": {
            "channel": "default",
            "enabled": true
          }
        }
      }
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# GDPR Status

Tells you whether the store has GDPR data requests switched on for the current channel. Check it before showing the data-request screens.

## Authentication

Public — send the storefront key. No customer token is needed. See the [Authentication](/api/graphql-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `channel` | String | Channel the setting was read for. |
| `enabled` | Boolean | `true` when customers can raise GDPR data requests. When `false`, every GDPR request operation returns an error. |

## Related Resources

- [Raise GDPR Request](/api/graphql-api/shop/gdpr-requests/mutations/create-gdpr-request)
- [List GDPR Requests](/api/graphql-api/shop/gdpr-requests/queries/list-gdpr-requests)
