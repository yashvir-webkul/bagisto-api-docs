---
outline: false
examples:
  - id: gdpr-status
    title: GDPR Status
    description: Whether customers can raise GDPR data requests on the current channel.
    request: |
      GET /api/shop/gdpr-status
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
    response: |
      [
        {
          "id": "default",
          "channel": "default",
          "enabled": true
        }
      ]
    commonErrors:
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
---

# GDPR Status

Tells you whether the store has GDPR data requests switched on for the current channel. Check it before showing the data-request screens.

## Endpoint

```
GET /api/shop/gdpr-status
```

## Authentication

Public — send the storefront key. No customer token is needed. See the [Authentication](/api/rest-api/authentication) page.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Channel code. |
| `channel` | string | Channel the setting was read for. |
| `enabled` | boolean | `true` when customers can raise GDPR data requests. When `false`, every GDPR request endpoint answers `400`. |

## Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | The GDPR setting of the current channel. |
| `401 Unauthorized` | Missing or invalid storefront key. |

## Related Resources

- [Raise GDPR Request](/api/rest-api/shop/gdpr-requests/create-gdpr-request)
- [List GDPR Requests](/api/rest-api/shop/gdpr-requests/list-gdpr-requests)
