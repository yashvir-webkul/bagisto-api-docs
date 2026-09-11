---
outline: false
examples:
  - id: list-returnable-orders
    title: List Returnable Orders
    description: The customer's orders a return can still be raised against — the list the New Request flow opens with.
    request: |
      GET /api/shop/returnable-orders
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    response: |
      [
        {
          "id": 41,
          "incrementId": "41",
          "status": "completed",
          "statusLabel": "Completed",
          "grandTotal": 160.0,
          "formattedGrandTotal": "$160.00",
          "orderCurrencyCode": "USD",
          "paymentMethodTitle": "Cash On Delivery",
          "totalQtyOrdered": 3,
          "totalReturnedQty": 1,
          "returnableQty": 2,
          "createdAt": "2026-08-30 09:12:44"
        }
      ]
    commonErrors:
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
  - id: list-returnable-orders-filtered
    title: Filter by Order Number
    description: Narrow the list to one order number, or to a status, and choose the sort.
    request: |
      GET /api/shop/returnable-orders?increment_id=41&sort=grand_total&order=desc
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy
      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    response: |
      [
        {
          "id": 41,
          "incrementId": "41",
          "status": "completed",
          "statusLabel": "Completed",
          "grandTotal": 160.0,
          "formattedGrandTotal": "$160.00",
          "orderCurrencyCode": "USD",
          "paymentMethodTitle": "Cash On Delivery",
          "totalQtyOrdered": 3,
          "totalReturnedQty": 1,
          "returnableQty": 2,
          "createdAt": "2026-08-30 09:12:44"
        }
      ]
    commonErrors:
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
---

# List Returnable Orders

The authenticated customer's orders that can still start a return. This is the first screen of a return: pick an order here, then read its items from [List Returnable Items](/api/rest-api/shop/returns/list-returnable-items) and submit with [Create Return](/api/rest-api/shop/returns/create-return).

## Endpoint

```
GET /api/shop/returnable-orders
```

## Authentication

This endpoint requires an authenticated customer — send the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page.

## When an Order Appears

An order is listed while all of the following hold. They are evaluated per item, so one eligible item is enough to list the order.

1. **The item was sold with returns allowed.** Eligibility is captured when the order is placed, from the product type the store permits returns for. An item placed while returns were off never becomes returnable later.
2. **The return window is still open.** Each item carries its own window, taken from the store's return period at the time of purchase, counted from the item's own date.
3. **Quantity is left.** Everything already requested on that item is subtracted; once the whole quantity is covered, the order drops off the list.
4. **The order is in a usable state.** Canceled, closed, fraud and pending-payment orders never appear.

An empty array means the customer has nothing to return right now — show that rather than an error.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `increment_id` | string | No | Match the order number, partially. |
| `status` | string | No | Match the order status exactly, e.g. `completed` or `processing`. |
| `sort` | string | No | `created_at` (default), `increment_id` or `grand_total`. |
| `order` | string | No | `desc` (default) or `asc`. |

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Order id — pass this as `order_id` to the returnable-items and create endpoints. |
| `incrementId` | string | Order number as the customer sees it. |
| `status` | string | Order status. |
| `statusLabel` | string | Translated status, ready to display. |
| `grandTotal` | number | Order total in the order's currency. |
| `formattedGrandTotal` | string | Total formatted in the order's currency. |
| `orderCurrencyCode` | string | Currency the order was placed in. |
| `paymentMethodTitle` | string | Payment method title, or `null` when the order has none recorded. |
| `totalQtyOrdered` | integer | Quantity across the order's returnable items. |
| `totalReturnedQty` | integer | Quantity already covered by returns. |
| `returnableQty` | integer | What is left — `totalQtyOrdered` minus `totalReturnedQty`. |
| `createdAt` | string | When the order was placed. |

`returnableQty` is a whole-order figure for display. The per-item caps the server actually enforces come from [List Returnable Items](/api/rest-api/shop/returns/list-returnable-items).

## Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | The list, possibly empty. |
| `401 Unauthorized` | Missing or invalid storefront key. |
| `403 Forbidden` | Missing or invalid customer Bearer token. |

## Related Resources

- [List Returnable Items](/api/rest-api/shop/returns/list-returnable-items) — the items of a chosen order, with the quantity caps
- [Create Return](/api/rest-api/shop/returns/create-return) — raise the return
- [Returns Overview](/api/rest-api/shop/returns/) — how the returns menu works
