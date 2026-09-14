---
outline: false
examples:
  - id: returnable-orders
    title: List Returnable Orders
    description: The customer's orders a return can still be raised against — the list the New Request flow opens with.
    query: |
      query {
        returnableOrders {
          id
          _id
          incrementId
          status
          statusLabel
          grandTotal
          formattedGrandTotal
          orderCurrencyCode
          paymentMethodTitle
          totalQtyOrdered
          totalReturnedQty
          returnableQty
          createdAt
        }
      }
    response: |
      {
        "data": {
          "returnableOrders": [
            {
              "id": "/api/shop/returnable_orders/41",
              "_id": 41,
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
        }
      }
    commonErrors:
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: 401 Unauthorized
        cause: Storefront key is missing or invalid
        solution: Provide a valid X-STOREFRONT-KEY header
  - id: returnable-orders-filtered
    title: Filter by Order Number
    description: Narrow the list to one order number, or to a status, and choose the sort.
    query: |
      query ($incrementId: String, $sort: String, $order: String) {
        returnableOrders(incrementId: $incrementId, sort: $sort, order: $order) {
          _id
          incrementId
          status
          formattedGrandTotal
          returnableQty
          createdAt
        }
      }
    variables: |
      {
        "incrementId": "41",
        "sort": "grand_total",
        "order": "desc"
      }
    response: |
      {
        "data": {
          "returnableOrders": [
            {
              "_id": 41,
              "incrementId": "41",
              "status": "completed",
              "formattedGrandTotal": "$160.00",
              "returnableQty": 2,
              "createdAt": "2026-08-30 09:12:44"
            }
          ]
        }
      }
    commonErrors:
      - error: 403 Forbidden
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
---

# List Returnable Orders

The authenticated customer's orders that can still start a return. This is the first step of a return: pick an order here, read its items with [List Returnable Items](/api/graphql-api/shop/returns/queries/list-returnable-items), then submit with [Create Return](/api/graphql-api/shop/returns/mutations/create-return).

## Authentication

This query requires an authenticated customer — send the storefront key and a customer Bearer token. See the [Authentication](/api/graphql-api/authentication) page.

## This Query Returns a Plain List

`returnableOrders` is a list, not a Relay connection — a customer has few returnable orders, so the whole set comes back in one call. Select the fields directly as the examples do. Asking for `edges`, `node`, `pageInfo` or `totalCount` is a schema error, and the same is true of [List Returnable Items](/api/graphql-api/shop/returns/queries/list-returnable-items).

An empty list means the customer has nothing to return right now — show that rather than an error.

## When an Order Appears

An order is listed while all of the following hold. They are evaluated per item, so one eligible item is enough to list the order.

1. **The item was sold with returns allowed.** Eligibility is captured when the order is placed, from the product type the store permits returns for. An item placed while returns were off never becomes returnable later.
2. **The return window is still open.** Each item carries its own window, taken from the store's return period at the time of purchase, counted from the item's own date.
3. **Quantity is left.** Everything already requested on that item is subtracted; once the whole quantity is covered, the order drops off the list.
4. **The order is in a usable state.** Canceled, closed, fraud and pending-payment orders never appear.

## Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `incrementId` | String | Match the order number, partially. |
| `status` | String | Match the order status exactly, e.g. `completed` or `processing`. |
| `sort` | String | `created_at` (default), `increment_id` or `grand_total`. |
| `order` | String | `desc` (default) or `asc`. |

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID | Resource IRI. |
| `_id` | Int | Order id — pass this as the order when listing items or creating the return. |
| `incrementId` | String | Order number as the customer sees it. |
| `status` | String | Order status. |
| `statusLabel` | String | Translated status, ready to display. |
| `grandTotal` | Float | Order total in the order's currency. |
| `formattedGrandTotal` | String | Total formatted in the order's currency. |
| `orderCurrencyCode` | String | Currency the order was placed in. |
| `paymentMethodTitle` | String | Payment method title, or `null` when the order has none recorded. |
| `totalQtyOrdered` | Int | Quantity across the order's returnable items. |
| `totalReturnedQty` | Int | Quantity already covered by returns. |
| `returnableQty` | Int | What is left — `totalQtyOrdered` minus `totalReturnedQty`. |
| `createdAt` | String | When the order was placed. |

`returnableQty` is a whole-order figure for display. The per-item caps the server actually enforces come from [List Returnable Items](/api/graphql-api/shop/returns/queries/list-returnable-items).

## Related Resources

- [List Returnable Items](/api/graphql-api/shop/returns/queries/list-returnable-items) — the items of a chosen order, with the quantity caps
- [Create Return](/api/graphql-api/shop/returns/mutations/create-return) — raise the return
