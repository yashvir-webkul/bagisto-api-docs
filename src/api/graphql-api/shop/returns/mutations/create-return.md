---
outline: false
examples:
  - id: create-return
    title: Raise a Return
    description: Raise a new return (RMA) request for one item of one of the authenticated customer's orders.
    query: |
      mutation CreateCustomerReturn(
        $orderId: Int!
        $orderItemId: Int!
        $rmaQty: Int!
        $resolutionType: String!
        $rmaReasonId: Int!
        $information: String
        $packageCondition: String
        $customAttributes: Iterable
        $agreement: Boolean!
      ) {
        createCustomerReturn(
          input: {
            orderId: $orderId
            orderItemId: $orderItemId
            rmaQty: $rmaQty
            resolutionType: $resolutionType
            rmaReasonId: $rmaReasonId
            information: $information
            packageCondition: $packageCondition
            customAttributes: $customAttributes
            agreement: $agreement
          }
        ) {
          customerReturn {
            _id
            orderId
            orderIncrementId
            statusId
            statusTitle
            statusColor
            packageCondition
            information
            canClose
            canReopen
            isExpired
            item
            images
            customAttributes
            messagesCount
            createdAt
            updatedAt
          }
        }
      }
    variables: |
      {
        "orderId": 45,
        "orderItemId": 78,
        "rmaQty": 1,
        "resolutionType": "return",
        "rmaReasonId": 2,
        "information": "Item arrived damaged.",
        "packageCondition": "open",
        "customAttributes": {
          "1": "INV-9921",
          "2": "morning"
        },
        "agreement": true
      }
    response: |
      {
        "data": {
          "createCustomerReturn": {
            "customerReturn": {
              "_id": 12,
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
              "createdAt": "2026-07-20T10:15:30+00:00",
              "updatedAt": "2026-07-20T10:15:30+00:00"
            }
          }
        }
      }
    commonErrors:
      - error: item not returnable
        cause: The order item is outside its return window or already fully returned/canceled
        solution: Query returnableItems first and only raise a return for an eligible item and quantity
      - error: agreement required
        cause: The agreement field was not set to true
        solution: Send agreement as true to confirm the return terms
      - error: The selected item is not eligible for return.
        cause: orderItemId carries a product id instead of the order item id
        solution: Use the orderItemId value from returnableItems — it identifies the order line, not the product
      - error: Package condition must be "open" or "packed".
        cause: packageCondition holds a value outside the two the storefront offers
        solution: Send open or packed, or omit the field
      - error: The field ":field" is required.
        cause: A required custom field was not answered in customAttributes
        solution: Query returnCustomFields and answer every field whose isRequired is true
      - error: UNAUTHENTICATED
        cause: Missing or invalid customer Bearer token
        solution: Log in and provide a valid customer authentication token
      - error: NOT_FOUND
        cause: The order does not exist or is not owned by the authenticated customer
        solution: Only order IDs belonging to the logged-in customer can be used
---

# Raise a Return

## About

The `createCustomerReturn` mutation raises a new return (RMA) request for one item of one of the customer's orders. The item must be return-eligible — check it with [`returnableItems`](/api/graphql-api/shop/returns/queries/list-returnable-items) first. The requested quantity (`rmaQty`) is capped server-side by the quantity the customer is actually allowed to return. The return starts in a `Pending` status.

## Authentication

This mutation requires an authenticated customer — send the storefront key and a customer Bearer token. See the [Authentication](/api/graphql-api/authentication) page.

## Input Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | `Int!` | ✅ Yes | Id of the order the item belongs to. |
| `orderItemId` | `Int!` | ✅ Yes | Id of the **order item** being returned — the `orderItemId` from `returnableItems`. This is the order line id, not the product id. |
| `rmaQty` | `Int!` | ✅ Yes | Quantity to return. Capped server-side by the returnable quantity. |
| `resolutionType` | `String!` | ✅ Yes | `return` or `cancel_items`. |
| `rmaReasonId` | `Int!` | ✅ Yes | Id of the chosen return reason — from `returnReasons`. |
| `information` | `String` | ❌ No | Free-text note about the return. |
| `packageCondition` | `String` | ❌ No | Reported package condition — `open` or `packed`. Any other value is rejected. |
| `customAttributes` | `Iterable` | ⚠️ Conditional | Answers to the return form's custom fields, keyed by field id — see [List Return Custom Fields](/api/graphql-api/shop/returns/queries/list-return-custom-fields). Required when the store has custom fields marked `isRequired`. |
| `agreement` | `Boolean!` | ✅ Yes | Must be `true` to confirm the return terms. |

### Custom Fields

The store can configure additional questions the shopper answers while raising a return. Query them with [`returnCustomFields`](/api/graphql-api/shop/returns/queries/list-return-custom-fields) and send the answers in `customAttributes`, keyed by the field `_id`:

- every field with `isRequired: true` must be answered, otherwise the mutation is rejected
- `select` and `radio` answers must be one of the field's option `value`s
- `multiselect` and `checkbox` answers take a list of option values
- the stored answers come back on the return as `customAttributes`

## Possible Returns

| Field | Type | Description |
|-------|------|-------------|
| `customerReturn._id` | `Int!` | Numeric return ID. |
| `customerReturn.orderId` | `Int!` | Id of the order the item belongs to. |
| `customerReturn.orderIncrementId` | `String!` | Human-readable order number. |
| `customerReturn.statusId` | `Int!` | Numeric status id — `1` (Pending) for a fresh return. |
| `customerReturn.statusTitle` | `String!` | Status label. |
| `customerReturn.statusColor` | `String!` | Hex color for the status badge. |
| `customerReturn.packageCondition` | `String` | Reported package condition. |
| `customerReturn.information` | `String` | The note supplied when raising the return. |
| `customerReturn.canClose` | `Boolean` | Whether the return can be closed. |
| `customerReturn.canReopen` | `Boolean` | Whether the return can be reopened. |
| `customerReturn.isExpired` | `Boolean` | Whether the return is past its action window. |
| `customerReturn.item` | `Object` | The returned item — `id`, `order_item_id`, `sku`, `name`, `quantity`, `resolution`, `reason_id`, `reason`, `variant_id`. Query bare (a JSON object). |
| `customerReturn.images` | `Array` | Attached images (`id`, `path`, `url`). Always empty on a return raised through this mutation — see [Attaching Evidence Photos](#attaching-evidence-photos). Query bare (a JSON array). |
| `customerReturn.customAttributes` | `Array` | Answers to the return's custom fields — `field_id`, `code`, `label`, `type`, `value`. Empty when the store has no custom fields. Query bare (a JSON array). |
| `customerReturn.messagesCount` | `Int!` | Number of conversation messages — `0` for a fresh return. |
| `customerReturn.createdAt` | `DateTime!` | Return creation timestamp. |
| `customerReturn.updatedAt` | `DateTime!` | Return last update timestamp. |

## Attaching Evidence Photos

A binary part cannot travel in a JSON GraphQL request, and photos can only go in while the return is being raised — there is no endpoint that adds them afterwards. So when the shopper attached files, raise the whole return over REST instead of through this mutation, sending the same fields as `multipart/form-data`:

```bash
curl -X POST "https://your-store.com/api/shop/returns" \
  -H "X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy" \
  -H "Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW" \
  -F "order_id=45" \
  -F "order_item_id=78" \
  -F "rma_qty=1" \
  -F "resolution_type=return" \
  -F "rma_reason_id=2" \
  -F "agreement=true" \
  -F "images[]=@/home/john/Pictures/damage-front.jpg" \
  -F "images[]=@/home/john/Pictures/damage-back.jpg"
```

Each file is checked against the mime types the store allows (Configuration → Sales → RMA → *Allowed file extension*). A return raised through this mutation always comes back with `images` empty, which is why the field reads as empty above rather than missing.

Files can still reach the store after the fact through the conversation — [`createCustomerReturnMessage`](/api/graphql-api/shop/returns/mutations/send-return-message) documents the REST call that carries one file per message.

## Related Resources

- [List Returnable Items](/api/graphql-api/shop/returns/queries/list-returnable-items)
- [List Return Reasons](/api/graphql-api/shop/returns/queries/list-return-reasons)
- [List Return Custom Fields](/api/graphql-api/shop/returns/queries/list-return-custom-fields)
- [Cancel a Return](/api/graphql-api/shop/returns/mutations/cancel-return)
- [Returns Overview](/api/graphql-api/shop/returns/)
