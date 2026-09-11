---
outline: false
---

# Returns (RMA)

Returns — also called RMA (Return Merchandise Authorization) — let a logged-in customer ask the store to take back or cancel an item they ordered. A customer can raise a return for an eligible item, converse with the store about it through a message thread, and cancel, reopen or close the request. Every return is scoped to the customer who owns it; a customer can only ever see and act on their own returns.

## Authentication

All return endpoints require an authenticated **customer** — provide the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page for how to obtain and send them.

## Returns must be switched on first

Returns are off out of the box. Nothing in the API errors when they are — [`GET /api/shop/returnable-items`](/api/rest-api/shop/returns/list-returnable-items) simply comes back empty, and a client sees an order with no returnable rows rather than a message explaining why. Three things have to line up, all configured on the admin side:

| Requirement | Where it lives | Effect when unset |
|-------------|----------------|-------------------|
| **Allowed product types** | Configuration → Sales → RMA → *Allowed product types* | An empty setting makes **nothing** returnable — it does not mean "all types". A product whose type is absent from the list is never eligible. |
| **Allow RMA on the product** | The product's own `allow_rma` attribute, off by default | That product's order items are never returnable. |
| **Return window** | The product's active RMA rule, otherwise Configuration → Sales → RMA → *Default allow days* (default `7`) | Falls back to the configured default. |

The decision is made **when the order is placed**, not when the return is requested: the resolved window is written onto the order item and frozen there. Enabling RMA later therefore does not make existing orders returnable — only orders placed after the change qualify. A client testing the flow against pre-existing orders will see an empty list no matter how the settings are changed.

An item then stays returnable while the order date plus that window has not passed, and while some quantity remains unrefunded and uncanceled.

## How a return works

1. **Find eligible orders.** Call [`GET /api/shop/returnable-orders`](/api/rest-api/shop/returns/list-returnable-orders) for the orders a return can still be raised against — an empty list means there is nothing to return, which is what the Returns area should reflect.
1. **Find eligible items.** Call [`GET /api/shop/returnable-items`](/api/rest-api/shop/returns/list-returnable-items) for an order to see which items are still within their return window and how many units can be returned or canceled.
2. **Pick a reason.** Call [`GET /api/shop/return-reasons`](/api/rest-api/shop/returns/list-return-reasons) for the resolution type (`return` or `cancel_items`) to get the reason ids to choose from.
3. **Collect the custom fields.** Call [`GET /api/shop/return-custom-fields`](/api/rest-api/shop/returns/list-return-custom-fields) for the extra questions the store asks on its return form. The list is often empty; when it is not, every field marked `isRequired` must be answered.
4. **Raise the return.** Call [`POST /api/shop/returns`](/api/rest-api/shop/returns/create-return) with the order, the item, a quantity, the resolution type, a reason id and the custom-field answers. Send it as `multipart/form-data` with `images[]` to attach evidence photos. The return starts in a `Pending` status.
5. **Converse.** Read the thread with [`GET /api/shop/return-messages`](/api/rest-api/shop/returns/list-return-messages) and add messages with [`POST /api/shop/return-messages`](/api/rest-api/shop/returns/send-return-message). Send that as `multipart/form-data` with a `file` field to attach a photo or document to the message.
6. **Cancel, reopen or close.** Use [cancel](/api/rest-api/shop/returns/cancel-return), [reopen](/api/rest-api/shop/returns/reopen-return) or [close](/api/rest-api/shop/returns/close-return) to change the state of the request.

## Status flags

Each return carries three action flags that tell a client which operations are currently allowed:

| Flag | Meaning |
|------|---------|
| `canClose` | The return can be closed (marked solved) by the customer. |
| `canReopen` | The return can be reopened back to pending. |
| `isExpired` | The return is past its allowed action window. |

These flags are populated on every return the API returns — the listing included — so a client can decide which buttons to show without a call per row.

## Quantity caps are enforced by the store

When raising a return, the quantity you send is capped server-side by the trusted quantity a customer is actually allowed to return or cancel for that item (`forReturnQuantity` / `forCancelQuantity` from `returnable-items`). You can never return more units than were ordered and are still eligible. Units held by a canceled or declined return are released back, so a shopper who withdrew a request can raise a new one for the same item.

## Custom fields

A store can add its own questions to the return form — an invoice number, a preferred pickup slot, and so on. [`GET /api/shop/return-custom-fields`](/api/rest-api/shop/returns/list-return-custom-fields) lists the active ones with their types and allowed options; the answers go into `custom_attributes` when raising the return, keyed by field id, and come back on the return as `customAttributes`. A field marked `isRequired` rejects the return when unanswered, so fetch this before rendering your form.

## Attaching files

There is no separate upload endpoint. A file rides along with the request that creates the record, on one of two endpoints, and both are REST-only — a JSON GraphQL request cannot carry a binary part.

| What | Endpoint | Field | Limits |
|------|----------|-------|--------|
| Evidence photos on the return | [`POST /api/shop/returns`](/api/rest-api/shop/returns/create-return) | `images[]`, several per return | Only the mime types the store allows (Configuration → Sales → RMA → *Allowed file extension*) |
| An attachment on a conversation message | [`POST /api/shop/return-messages`](/api/rest-api/shop/returns/send-return-message) | `file`, one per message | Any type the store accepts; not restricted to the configured image types |

Send the request as `multipart/form-data` with the rest of the fields as ordinary form fields:

```bash
# Evidence photos while raising the return
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

# A file on a message in the conversation
curl -X POST "https://your-store.com/api/shop/return-messages" \
  -H "X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy" \
  -H "Authorization: Bearer 438|aSV6JyFn299xuoR6wr5KKOodyIlMA26h0IgHiqLW" \
  -F "return_id=12" \
  -F "message=Photo of the broken zipper" \
  -F "file=@/home/john/Pictures/zipper.png"
```

Evidence photos can only be attached while raising the return; there is no way to add them to an existing one. A message attachment has no such limit — post another message whenever the customer has another file.

## Endpoints

| Operation | Method & Path | Description |
|-----------|---------------|-------------|
| [List own returns](/api/rest-api/shop/returns/list-returns) | `GET /api/shop/returns` | The customer's own returns, newest first. |
| [View one return](/api/rest-api/shop/returns/view-return) | `GET /api/shop/returns/{id}` | A single return the customer owns. |
| [Raise a return](/api/rest-api/shop/returns/create-return) | `POST /api/shop/returns` | Create a new return for one order item. |
| [Cancel a return](/api/rest-api/shop/returns/cancel-return) | `POST /api/shop/returns/{id}/cancel` | Cancel the customer's own return. |
| [Reopen a return](/api/rest-api/shop/returns/reopen-return) | `POST /api/shop/returns/{id}/reopen` | Reopen a canceled/declined return. |
| [Close a return](/api/rest-api/shop/returns/close-return) | `POST /api/shop/returns/{id}/close` | Mark a return solved. |
| [List returnable orders](/api/rest-api/shop/returns/list-returnable-orders) | `GET /api/shop/returnable-orders` | Orders a return can still be raised against. |
| [List returnable items](/api/rest-api/shop/returns/list-returnable-items) | `GET /api/shop/returnable-items` | Return-eligible items of one of the customer's orders. |
| [List return reasons](/api/rest-api/shop/returns/list-return-reasons) | `GET /api/shop/return-reasons` | Active reasons for a resolution type. |
| [List return custom fields](/api/rest-api/shop/returns/list-return-custom-fields) | `GET /api/shop/return-custom-fields` | The store's extra questions on the return form. |
| [List return messages](/api/rest-api/shop/returns/list-return-messages) | `GET /api/shop/return-messages` | The conversation thread of a return. |
| [Send a message](/api/rest-api/shop/returns/send-return-message) | `POST /api/shop/return-messages` | Add a message to the return conversation. |
