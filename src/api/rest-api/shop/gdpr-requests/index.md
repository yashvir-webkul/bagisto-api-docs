---
outline: false
---

# GDPR Data Requests

GDPR data requests let a logged-in customer exercise their data-protection rights — asking the store to **delete** their account data or to **update** the personal data held about them. Every request is created, listed, viewed, revoked and deleted by the customer who owns it; a customer can only ever see and act on their own requests.

## Authentication

All GDPR endpoints require an authenticated **customer** — provide the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page for how to obtain and send them.

## GDPR must be enabled by the store

Every GDPR endpoint first checks whether GDPR data requests are switched on in the store's admin configuration. **If GDPR is turned off, the call fails with HTTP 400** and this message:

```json
{
  "type": "/errors/400",
  "title": "Bad Request",
  "status": 400,
  "detail": "GDPR data requests are disabled. Please enable GDPR from the admin configuration."
}
```

When you see this message, the feature has been disabled on the admin side — it must be re-enabled in the store's admin configuration before any GDPR request can be raised, listed, revoked or deleted.

## Request lifecycle

A GDPR request moves through these statuses:

| Status | Meaning |
|--------|---------|
| `pending` | The request was just raised and is awaiting review. |
| `processing` | The store has started working on the request. |
| `declined` | The store reviewed and declined the request. |
| `approved` | The store reviewed and approved (fulfilled) the request. |
| `revoked` | The customer withdrew the request before it was finished. |

A customer raises a request (`pending`), can **revoke** it while it is still `pending` or `processing`, and can **delete** the request record entirely.

## Request type

| Type | Meaning |
|------|---------|
| `delete` | Request the store to delete the customer's account data. |
| `update` | Request the store to update the personal data held about the customer. |

## Endpoints

| Operation | Method & Path | Description |
|-----------|---------------|-------------|
| [Check status](/api/rest-api/shop/gdpr-requests/gdpr-status) | `GET /api/shop/gdpr-status` | Whether GDPR requests are enabled on the channel. |
| [List own requests](/api/rest-api/shop/gdpr-requests/list-gdpr-requests) | `GET /api/shop/gdpr-requests` | Paginated list of the customer's own GDPR requests. |
| [View one request](/api/rest-api/shop/gdpr-requests/view-gdpr-request) | `GET /api/shop/gdpr-requests/{id}` | A single request the customer owns. |
| [Raise a request](/api/rest-api/shop/gdpr-requests/create-gdpr-request) | `POST /api/shop/gdpr-requests` | Raise a new `delete` or `update` request. |
| [Revoke a request](/api/rest-api/shop/gdpr-requests/revoke-gdpr-request) | `POST /api/shop/gdpr-requests/{id}/revoke` | Withdraw a `pending` / `processing` request. |
| [Delete a request](/api/rest-api/shop/gdpr-requests/delete-gdpr-request) | `DELETE /api/shop/gdpr-requests/{id}` | Remove a request record. |
