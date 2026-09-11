---
outline: false
examples:
  - id: send-return-message
    title: Send a Return Message
    description: Add a customer message to the conversation thread of a return (RMA) request.
    request: |
      POST /api/shop/return-messages
      Content-Type: application/json
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
      Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW

      {
        "return_id": 12,
        "message": "Any update on my return?"
      }
    response: |
      {
        "id": 89,
        "rmaId": 12,
        "message": "Any update on my return?",
        "isAdmin": false,
        "attachment": null,
        "attachmentUrl": null,
        "createdAt": "2026-07-20T11:15:00.000000Z"
      }
    commonErrors:
      - error: 400 Bad Request
        cause: The message field is missing
        solution: Provide a non-empty message
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
      - error: 404 Not Found
        cause: The return does not exist or is not owned by the authenticated customer
        solution: Only return IDs belonging to the logged-in customer can be messaged
  - id: send-return-message-with-attachment
    title: Send a Message With an Attachment
    description: Attach a photo or document to the message by sending the body as multipart/form-data.
    request: |
      curl -X POST "https://your-store.com/api/shop/return-messages" \
        -H "X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy" \
        -H "Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW" \
        -F "return_id=12" \
        -F "message=Photo of the damaged zipper attached." \
        -F "file=@/home/john/Pictures/zipper.png"

      # @ before the path is what reads the file from disk. Do not set a
      # Content-Type header — curl builds the multipart body and boundary.
    response: |
      {
        "id": 90,
        "rmaId": 12,
        "message": "Photo of the damaged zipper attached.",
        "isAdmin": false,
        "attachment": "zipper.png",
        "attachmentUrl": "https://example.com/storage/rma-conversation/90/uWMoDLnDasmYZHnefiimBsBlydHKhP28zPHZxZbl.png",
        "createdAt": "2026-07-20T11:18:00.000000Z"
      }
    commonErrors:
      - error: 415 Unsupported Media Type
        cause: The body was sent as multipart/form-data against a deployment that predates attachment support
        solution: Upgrade to a package version that accepts multipart on this endpoint, or send the message as JSON without a file
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: 404 Not Found
        cause: The return does not exist or is not owned by the authenticated customer
        solution: Only return IDs belonging to the logged-in customer can be messaged
---

# Send a Return Message

Add a customer message to the conversation thread of a return (RMA) request. The return must belong to the authenticated customer. The created message comes back flagged `isAdmin: false`.

## Endpoint

```
POST /api/shop/return-messages
```

## Authentication

This endpoint requires an authenticated customer — send the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page.

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json`, or `multipart/form-data` when the message carries an attachment |
| `X-STOREFRONT-KEY` | Yes | Your storefront API key |
| `Authorization` | Yes | Bearer token (customer login required) |

## Request Body

```json
{
  "return_id": 12,
  "message": "Any update on my return?"
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `return_id` | integer | Yes | Id of the return to add the message to. Must belong to the authenticated customer. |
| `message` | string | Yes | The message text. |

## Attachments

A message can carry one file — a photo of the damaged item, a scan, a receipt. Send the same fields as `multipart/form-data` instead of a JSON body and add the file in a `file` field:

```bash
curl -X POST https://your-store.com/api/shop/return-messages \
  -H "X-STOREFRONT-KEY: pk_storefront_..." \
  -H "Authorization: Bearer <customer-token>" \
  -F "return_id=12" \
  -F "message=Photo of the damaged zipper attached." \
  -F "file=@zipper.png"
```

- **One file per message.** To send several, post several messages; each keeps its own attachment.
- **The stored file is renamed.** The server stores it under `rma-conversation/{messageId}/` with a generated name, and the extension is derived from the file's detected type. `attachment` in the response keeps the name the customer uploaded, so show that in the conversation and link to `attachmentUrl`.
- **Any file type the store accepts is allowed here.** Unlike the evidence images on [Create Return](/api/rest-api/shop/returns/create-return), a conversation attachment is not restricted to the configured image types.
- **JSON stays valid.** Omit the file and send `application/json` exactly as in the first example; `attachment` and `attachmentUrl` then come back `null`.

## Response Fields (201 Created)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Numeric message id. |
| `rmaId` | integer | Id of the return the message belongs to. |
| `message` | string | The message text. |
| `isAdmin` | boolean | `false` — the message was sent by the customer. |
| `attachment` | string | File name as the customer uploaded it, or `null` when the message has no attachment. |
| `attachmentUrl` | string | Public URL of the stored file, or `null`. |
| `createdAt` | string | ISO 8601 message timestamp. |

## Status Codes

| Status | Meaning |
|--------|---------|
| `201 Created` | Message added to the return conversation, with the attachment stored when one was sent. |
| `400 Bad Request` | `message` is missing. |
| `401 Unauthorized` | Missing or invalid storefront key. |
| `403 Forbidden` | Missing or invalid customer Bearer token. |
| `404 Not Found` | The return does not exist or is not the customer's. |

## Related Resources

- [List Return Messages](/api/rest-api/shop/returns/list-return-messages) — the conversation thread on a return
- [View Return](/api/rest-api/shop/returns/view-return) — one return with its status flags
- [Returns Overview](/api/rest-api/shop/returns/) — the returns menu overview, including the settings that gate it
