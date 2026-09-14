---
outline: false
---

# EU Right of Withdrawal

The EU right-of-withdrawal endpoints let a shopper formally declare that they are exercising their statutory right to withdraw from a purchase (the EU "cooling-off" right). Filing a declaration records the withdrawal against an order and triggers a durable-medium confirmation email back to the shopper — the legally required acknowledgement that the store received their notice.

Both **authenticated customers** (filing against one of their own orders) and **guests** (proving ownership with an order increment id + email) can file a declaration.

## Authentication

The list, view and authenticated-file endpoints require an authenticated **customer** — provide the storefront key and a customer Bearer token. See the [Authentication](/api/rest-api/authentication) page for how to obtain and send them.

The **guest** file endpoint requires only the storefront key — no customer token. Ownership of the order is proved by supplying the matching order increment id and email.

## Withdrawal must be switched on first

The feature ships **disabled**. It is turned on per channel in Configuration → Sales → EU Right of Withdrawal, and the setting defaults to off, so a fresh store rejects every filing attempt until an admin enables it.

Two things make this easy to misdiagnose:

- **The error does not mention the setting.** A filing attempt against a disabled channel fails with `404` and *"The order could not be found or is not eligible for withdrawal."* — the same message an unknown or mismatched order produces. A developer sees "order not found" and goes looking for a wrong order id or email, when the real cause is the configuration flag.
- **The check follows the order's own channel.** Enabling withdrawal on one channel does not enable it for orders placed on another. The gate reads the channel the order belongs to, not the channel the request is made against.

Only the two filing endpoints are gated. Listing and viewing declarations keep working even after the feature is switched off, so declarations filed while it was enabled remain readable.

## Filing is idempotent

Filing a withdrawal is **idempotent per order**. If a declaration already exists for the given order, a second `POST` returns the existing declaration unchanged instead of creating a duplicate or raising an error. A confirmation email is sent when the declaration is first created.

## Confirmation on a durable medium

When a declaration is first recorded, the store sends a confirmation email to the shopper — the durable-medium acknowledgement the withdrawal right requires. The `confirmationSentAt` timestamp reflects when that email was dispatched.

## Guest vs authenticated

| Flow | Who | How ownership is proved | Fields returned |
|------|-----|-------------------------|-----------------|
| Authenticated | Logged-in customer | The order belongs to the authenticated customer | Full set (includes decline / refund fields) |
| Guest | Anyone with the order details | Order increment id **+** email must match a guest order | Reduced set (no decline / refund fields) |

## Declaration lifecycle

A withdrawal declaration moves through these statuses:

| Status | Meaning |
|--------|---------|
| `received` | The declaration was received and acknowledged. |
| `declined` | The store reviewed and declined the withdrawal. |
| `refunded` | The withdrawal was accepted and the order refunded. |

## Endpoints

| Operation | Method & Path | Description |
|-----------|---------------|-------------|
| [Check status](/api/rest-api/shop/eu-withdrawal/eu-withdrawal-status) | `GET /api/shop/eu-withdrawal-status` | Whether EU withdrawal is enabled on the channel. |
| [List own declarations](/api/rest-api/shop/eu-withdrawal/list-eu-withdrawals) | `GET /api/shop/eu-withdrawals` | Paginated list of the customer's own declarations. |
| [View one declaration](/api/rest-api/shop/eu-withdrawal/view-eu-withdrawal) | `GET /api/shop/eu-withdrawals/{id}` | A single declaration the customer owns. |
| [File (authenticated)](/api/rest-api/shop/eu-withdrawal/create-eu-withdrawal) | `POST /api/shop/eu-withdrawals` | File a declaration against one of the customer's own orders. |
| [File (guest)](/api/rest-api/shop/eu-withdrawal/create-guest-eu-withdrawal) | `POST /api/shop/eu-withdrawals/guest` | File a declaration for a guest order using order id + email. |
