---
outline: false
examples:
  - id: create-return
    title: Raise a Return
    description: Raise a new return (RMA) request for one item of one of the authenticated customer's orders.
    request: |
      POST /api/shop/returns
      Content-Type: application/json
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
      Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW

      {
        "order_id": 45,
        "order_item_id": 78,
        "rma_qty": 1,
        "resolution_type": "return",
        "rma_reason_id": 2,
        "information": "Item arrived damaged.",
        "package_condition": "open",
        "custom_attributes": {
          "1": "INV-9921",
          "2": "morning"
        },
        "agreement": true
      }
    response: |
      {
        "id": 12,
        "orderId": 45,
        "orderIncrementId": "000000045",
        "statusId": 1,
        "statusTitle": "Pending",
        "statusColor": "#FDB022",
        "packageCondition": "open",
        "information": "Item arrived damaged.",
        "canClose": true,
        "canReopen": false,
        "isExpired": false,
        "item": {
          "id": 30,
          "order_item_id": 78,
          "sku": "COASTALBREEZEMENSHOODIE",
          "name": "Coastal Breeze Men's Blue Zipper Hoodie",
          "quantity": 1,
          "resolution": "return",
          "reason_id": 2,
          "reason": "Damaged product",
          "variant_id": null
        },
        "images": [],
        "customAttributes": [
          {
            "field_id": 1,
            "code": "invoice_number",
            "label": "Invoice number",
            "type": "text",
            "value": "INV-9921"
          },
          {
            "field_id": 2,
            "code": "pickup_slot",
            "label": "Preferred pickup slot",
            "type": "select",
            "value": "morning"
          }
        ],
        "messagesCount": 0,
        "createdAt": "2026-07-20T10:15:30.000000Z",
        "updatedAt": "2026-07-20T10:15:30.000000Z"
      }
    commonErrors:
      - error: 400 Bad Request
        cause: The item is outside its return window / already returned, the quantity is invalid, or agreement was not true
        solution: Query returnable-items first and send an eligible item, a valid quantity and agreement as true
      - error: 400 Bad Request — The selected item is not eligible for return.
        cause: order_item_id carries a product id instead of the order item id
        solution: Use the orderItemId value from returnable-items — it identifies the order line, not the product
      - error: 400 Bad Request — Package condition must be "open" or "packed".
        cause: package_condition holds a value outside the two the storefront offers
        solution: Send open or packed, or omit the field
      - error: 400 Bad Request — The field ":field" is required.
        cause: A required custom field was not answered in custom_attributes
        solution: Query return-custom-fields and answer every field whose isRequired is true
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
      - error: 404 Not Found
        cause: The order does not exist or is not owned by the authenticated customer
        solution: Only order IDs belonging to the logged-in customer can be used
  - id: create-return-with-images
    title: Raise a Return With Evidence Photos
    description: Attach photos of the item by sending the same fields as multipart/form-data. Photos can only be attached while the return is raised.
    request: |
      curl -X POST "https://your-store.com/api/shop/returns" \
        -H "X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy" \
        -H "Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW" \
        -F "order_id=45" \
        -F "order_item_id=78" \
        -F "rma_qty=1" \
        -F "resolution_type=return" \
        -F "rma_reason_id=2" \
        -F "information=Item arrived damaged." \
        -F "package_condition=open" \
        -F "custom_attributes[1]=INV-9921" \
        -F "custom_attributes[2]=morning" \
        -F "agreement=true" \
        -F "images[]=@/home/john/Pictures/damage-front.jpg" \
        -F "images[]=@/home/john/Pictures/damage-back.jpg"

      # @ before the path is what reads the file from disk. Do not set a
      # Content-Type header — curl builds the multipart body and boundary.
    response: |
      {
        "id": 12,
        "orderId": 45,
        "orderIncrementId": "000000045",
        "statusId": 1,
        "statusTitle": "Pending",
        "statusColor": "#FDB022",
        "packageCondition": "open",
        "information": "Item arrived damaged.",
        "canClose": true,
        "canReopen": false,
        "isExpired": false,
        "item": {
          "id": 30,
          "order_item_id": 78,
          "sku": "COASTALBREEZEMENSHOODIE",
          "name": "Coastal Breeze Men's Blue Zipper Hoodie",
          "quantity": 1,
          "resolution": "return",
          "reason_id": 2,
          "reason": "Damaged product",
          "variant_id": null
        },
        "images": [
          {
            "id": 7,
            "path": "rma/12/9kKqQ2mVYyJk0m4lM4pYyzVvJt1s0Hx2DzQpLb3n.jpg",
            "url": "https://example.com/storage/rma/12/9kKqQ2mVYyJk0m4lM4pYyzVvJt1s0Hx2DzQpLb3n.jpg"
          },
          {
            "id": 8,
            "path": "rma/12/Rb7wTfE0aXnQpKcM2sYvUo6lHj4dZ1gN8xVrLmPt.jpg",
            "url": "https://example.com/storage/rma/12/Rb7wTfE0aXnQpKcM2sYvUo6lHj4dZ1gN8xVrLmPt.jpg"
          }
        ],
        "customAttributes": [
          {
            "field_id": 1,
            "code": "invoice_number",
            "label": "Invoice number",
            "type": "text",
            "value": "INV-9921"
          },
          {
            "field_id": 2,
            "code": "pickup_slot",
            "label": "Preferred pickup slot",
            "type": "select",
            "value": "morning"
          }
        ],
        "messagesCount": 0,
        "createdAt": "2026-07-20T10:15:30.000000Z",
        "updatedAt": "2026-07-20T10:15:30.000000Z"
      }
    commonErrors:
      - error: 400 Bad Request — Invalid file type
        cause: A file in images[] is not one of the mime types the store allows
        solution: Check Configuration → Sales → RMA → Allowed file extension and send only those types
      - error: 400 Bad Request
        cause: A required field is missing, or agreement was not sent as true
        solution: Send every required field; agreement must be true
---

# Raise a Return

Raise a new return (RMA) request for one item of one of the customer's orders. The item must be return-eligible — check it with [`GET /api/shop/returnable-items`](/api/rest-api/shop/returns/list-returnable-items) first. The requested quantity (`rma_qty`) is capped server-side by the quantity the customer is actually allowed to return. The return starts in a `Pending` status.

## Endpoint

```
POST /api/shop/returns
```

## Authentication

This endpoint requires an authenticated customer — send the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page.

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | application/json |
| `X-STOREFRONT-KEY` | Yes | Your storefront API key |
| `Authorization` | Yes | Bearer token (customer login required) |

## Request Body

```json
{
  "order_id": 45,
  "order_item_id": 78,
  "rma_qty": 1,
  "resolution_type": "return",
  "rma_reason_id": 2,
  "information": "Item arrived damaged.",
  "package_condition": "open",
  "custom_attributes": {
    "1": "INV-9921",
    "2": "morning"
  },
  "agreement": true
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | integer | Yes | Id of the order the item belongs to. |
| `order_item_id` | integer | Yes | Id of the **order item** being returned — the `orderItemId` from `returnable-items`. This is the order line id, not the product id. |
| `rma_qty` | integer | Yes | Quantity to return. Capped server-side by the returnable quantity. |
| `resolution_type` | string | Yes | `return` or `cancel_items`. |
| `rma_reason_id` | integer | Yes | Id of the chosen return reason — from `return-reasons`. |
| `information` | string | No | Free-text note about the return. |
| `package_condition` | string | No | Reported package condition — `open` or `packed`. Any other value is rejected. |
| `custom_attributes` | object | Conditional | Answers to the return form's custom fields, keyed by field id — see [List Return Custom Fields](/api/rest-api/shop/returns/list-return-custom-fields). Required when the store has custom fields marked `isRequired`. |
| `agreement` | boolean | Yes | Must be `true` to confirm the return terms. |

### Custom Fields

The store can configure additional questions the shopper answers while raising a return. Fetch them with [`GET /api/shop/return-custom-fields`](/api/rest-api/shop/returns/list-return-custom-fields) and send the answers in `custom_attributes`, keyed by the field `id`:

- every field with `isRequired: true` must be answered, otherwise the request is rejected
- `select` and `radio` answers must be one of the field's option `value`s
- `multiselect` and `checkbox` answers take a list of option values
- the stored answers come back on the return as `customAttributes`

### Attaching Images

To attach evidence images, send the same fields as `multipart/form-data` with an `images[]` file field instead of a JSON body:

```bash
curl -X POST https://your-store.com/api/shop/returns \
  -H "X-STOREFRONT-KEY: pk_storefront_..." \
  -H "Authorization: Bearer <customer-token>" \
  -F "order_id=45" \
  -F "order_item_id=78" \
  -F "rma_qty=1" \
  -F "resolution_type=return" \
  -F "rma_reason_id=2" \
  -F "package_condition=open" \
  -F "agreement=1" \
  -F "custom_attributes[1]=INV-9921" \
  -F "images[]=@damage-front.png" \
  -F "images[]=@damage-back.png"
```

Each file is checked against the mime types the store allows for returns (admin → **Settings → RMA → Allowed file extension**); an unsupported file rejects the whole request with `400`. Images can only be attached while raising the return — there is no separate upload endpoint — and file uploads are REST-only, since a JSON GraphQL request cannot carry a file.

## Response Fields (201 Created)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Return ID. |
| `orderId` | integer | Id of the order the item belongs to. |
| `orderIncrementId` | string | Human-readable order number. |
| `statusId` | integer | Numeric status id — `1` (Pending) for a fresh return. |
| `statusTitle` | string | Status label. |
| `statusColor` | string | Hex color for the status badge. |
| `packageCondition` | string | Reported package condition. |
| `information` | string | The note supplied when raising the return. |
| `canClose` | boolean | Whether the return can be closed. |
| `canReopen` | boolean | Whether the return can be reopened. |
| `isExpired` | boolean | Whether the return is past its action window. |
| `item` | object | The returned item — `id`, `order_item_id`, `sku`, `name`, `quantity`, `resolution`, `reason_id`, `reason`, `variant_id`. |
| `images` | array | Attached images (`id`, `path`, `url`). Empty when no files were sent. |
| `customAttributes` | array | Answers to the return's custom fields — `field_id`, `code`, `label`, `type`, `value`. Empty when the store has no custom fields. |
| `messagesCount` | integer | Number of conversation messages — `0` for a fresh return. |
| `createdAt` | string | ISO 8601 creation timestamp. |
| `updatedAt` | string | ISO 8601 last update timestamp. |

## Status Codes

| Status | Meaning |
|--------|---------|
| `201 Created` | Return raised; status is `Pending`. |
| `400 Bad Request` | Item not eligible, invalid quantity, `agreement` not `true`, unknown `package_condition`, an unanswered required custom field, a value outside a field's options, or an unsupported image type. |
| `401 Unauthorized` | Missing or invalid storefront key. |
| `403 Forbidden` | Missing or invalid customer Bearer token. |
| `404 Not Found` | The order does not exist or is not the customer's. |

## Related Resources

- [List Returnable Items](/api/rest-api/shop/returns/list-returnable-items) — which order items are still eligible, and for how many units
- [List Return Reasons](/api/rest-api/shop/returns/list-return-reasons) — the reason ids to choose from
- [List Return Custom Fields](/api/rest-api/shop/returns/list-return-custom-fields) — the extra questions to answer in `custom_attributes`
- [Cancel a Return](/api/rest-api/shop/returns/cancel-return) — withdraw a return the customer raised
- [Returns Overview](/api/rest-api/shop/returns/) — the returns menu overview, including the settings that gate it
