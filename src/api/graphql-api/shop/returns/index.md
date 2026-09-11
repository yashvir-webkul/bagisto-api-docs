---
outline: false
---

# Returns (RMA)

Returns — also called RMA (Return Merchandise Authorization) — let a logged-in customer ask the store to take back or cancel an item they ordered. A customer can raise a return for an eligible item, converse with the store about it through a message thread, and cancel, reopen or close the request. Every return is scoped to the customer who owns it; a customer can only ever see and act on their own returns.

## Authentication

All return endpoints require an authenticated **customer** — provide the storefront key and a customer Bearer token. See the [Authentication](/api/graphql-api/authentication) page for how to obtain and send them.

## Returns must be switched on first

Returns are off out of the box. Nothing in the API errors when they are — [`returnableItems`](/api/graphql-api/shop/returns/queries/list-returnable-items) simply comes back empty, and a client sees an order with no returnable rows rather than a message explaining why. Three things have to line up, all configured on the admin side:

| Requirement | Where it lives | Effect when unset |
|-------------|----------------|-------------------|
| **Allowed product types** | Configuration → Sales → RMA → *Allowed product types* | An empty setting makes **nothing** returnable — it does not mean "all types". A product whose type is absent from the list is never eligible. |
| **Allow RMA on the product** | The product's own `allow_rma` attribute, off by default | That product's order items are never returnable. |
| **Return window** | The product's active RMA rule, otherwise Configuration → Sales → RMA → *Default allow days* (default `7`) | Falls back to the configured default. |

The decision is made **when the order is placed**, not when the return is requested: the resolved window is written onto the order item and frozen there. Enabling RMA later therefore does not make existing orders returnable — only orders placed after the change qualify. A client testing the flow against pre-existing orders will see an empty list no matter how the settings are changed.

An item then stays returnable while the order date plus that window has not passed, and while some quantity remains unrefunded and uncanceled.

## How a return works

1. **Find eligible orders.** Query [`returnableOrders`](/api/graphql-api/shop/returns/queries/list-returnable-orders) for the orders a return can still be raised against — an empty list means there is nothing to return, which is what the Returns area should reflect.
1. **Find eligible items.** Query [`returnableItems`](/api/graphql-api/shop/returns/queries/list-returnable-items) for an order to see which items are still within their return window and how many units can be returned or canceled.
2. **Pick a reason.** Query [`returnReasons`](/api/graphql-api/shop/returns/queries/list-return-reasons) for the resolution type (`return` or `cancel_items`) to get the reason ids to choose from.
3. **Collect the custom fields.** Query [`returnCustomFields`](/api/graphql-api/shop/returns/queries/list-return-custom-fields) for the extra questions the store asks on its return form. The list is often empty; when it is not, every field marked `isRequired` must be answered.
4. **Raise the return.** Call [`createCustomerReturn`](/api/graphql-api/shop/returns/mutations/create-return) with the order, the item, a quantity, the resolution type, a reason id and the custom-field answers. The return starts in a `Pending` status.
5. **Converse.** Read the thread with [`customerReturnMessages`](/api/graphql-api/shop/returns/queries/list-return-messages) and add messages with [`createCustomerReturnMessage`](/api/graphql-api/shop/returns/mutations/send-return-message).
6. **Cancel, reopen or close.** Use [`cancelCustomerReturn`](/api/graphql-api/shop/returns/mutations/cancel-return), [`reopenCustomerReturn`](/api/graphql-api/shop/returns/mutations/reopen-return) or [`closeCustomerReturn`](/api/graphql-api/shop/returns/mutations/close-return) to change the state of the request.

## Status flags

Each return carries three action flags that tell a client which operations are currently allowed:

| Flag | Meaning |
|------|---------|
| `canClose` | The return can be closed (marked solved) by the customer. |
| `canReopen` | The return can be reopened back to pending. Only a canceled or declined return qualifies, and only while the matching admin setting allows re-requests for that state. |
| `isExpired` | The return is past its window — the same order-date-plus-return-period window that made the item returnable, not a separate countdown from when the return was raised. |

These flags are populated on every return the API returns — the listing included — so a client can decide which buttons to show without a query per row.

## Quantity caps are enforced by the store

When raising a return, the quantity you send is capped server-side by the trusted quantity a customer is actually allowed to return or cancel for that item (`forReturnQuantity` / `forCancelQuantity` from `returnableItems`). You can never return more units than were ordered and are still eligible. Units held by a canceled or declined return are released back, so a shopper who withdrew a request can raise a new one for the same item.

## Custom fields

A store can add its own questions to the return form — an invoice number, a preferred pickup slot, and so on. [`returnCustomFields`](/api/graphql-api/shop/returns/queries/list-return-custom-fields) lists the active ones with their types and allowed options; the answers go into `customAttributes` when raising the return, keyed by field id, and come back on the return as `customAttributes`. A field marked `isRequired` rejects the mutation when unanswered, so query it before rendering your form.

## Attaching images

Evidence photos can only be attached while raising the return, and only over REST — [`POST /api/shop/returns`](/api/rest-api/shop/returns/create-return) as `multipart/form-data` with an `images[]` file field. A JSON GraphQL request cannot carry a file and there is no separate upload endpoint, so a return with images has to be raised over REST.

## Endpoints

| Operation | GraphQL field | Description |
|-----------|---------------|-------------|
| List own returns | [`customerReturns`](/api/graphql-api/shop/returns/queries/list-returns) | Paginated list of the customer's own returns. |
| View one return | [`customerReturn`](/api/graphql-api/shop/returns/queries/view-return) | A single return the customer owns. |
| List returnable orders | [`returnableOrders`](/api/graphql-api/shop/returns/queries/list-returnable-orders) | Orders a return can still be raised against. |
| List returnable items | [`returnableItems`](/api/graphql-api/shop/returns/queries/list-returnable-items) | Return-eligible items of one of the customer's orders. |
| List return reasons | [`returnReasons`](/api/graphql-api/shop/returns/queries/list-return-reasons) | Active reasons for a resolution type. |
| List return custom fields | [`returnCustomFields`](/api/graphql-api/shop/returns/queries/list-return-custom-fields) | The store's extra questions on the return form. |
| List return messages | [`customerReturnMessages`](/api/graphql-api/shop/returns/queries/list-return-messages) | The conversation thread of a return. |
| Raise a return | [`createCustomerReturn`](/api/graphql-api/shop/returns/mutations/create-return) | Create a new return for one order item. |
| Cancel a return | [`cancelCustomerReturn`](/api/graphql-api/shop/returns/mutations/cancel-return) | Cancel the customer's own return. |
| Reopen a return | [`reopenCustomerReturn`](/api/graphql-api/shop/returns/mutations/reopen-return) | Reopen a canceled/declined return. |
| Close a return | [`closeCustomerReturn`](/api/graphql-api/shop/returns/mutations/close-return) | Mark a return solved. |
| Send a message | [`createCustomerReturnMessage`](/api/graphql-api/shop/returns/mutations/send-return-message) | Add a message to the return conversation. |
