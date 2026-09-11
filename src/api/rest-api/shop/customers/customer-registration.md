---
outline: false
examples:
  - id: register-customer
    title: Customer Registration
    description: Create a new customer account with complete profile information.
    request: |
      POST /api/shop/customers
      Content-Type: application/json
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy

      {
        "firstName": "John",
        "lastName": "Doe",
        "gender": "Male",
        "dateOfBirth": "01/15/1990",
        "phone": "5550123",
        "status": "1",
        "isVerified": "1",
        "isSuspended": "0",
        "email": "john.doe@example.com",
        "password": "SecurePass@123",
        "confirmPassword": "SecurePass@123",
        "subscribedToNewsLetter": true
      }
    response: |
      {
        "id": 12,
        "firstName": "John",
        "lastName": "Doe",
        "gender": "Male",
        "dateOfBirth": "1990-01-15",
        "email": "john@example.com",
        "phone": "1234567890",
        "status": 1,
        "apiToken": "LXrSaQRvrKfSNz5CtHr2r2hBZQ7HtWGVKvNoORHOcsmo0aYpSi7MVPk5dOV3Kjcqjr57MSSQ2eM2lcrg",
        "customerGroupId": 2,
        "channelId": 1,
        "subscribedToNewsLetter": true,
        "isVerified": 1,
        "isSuspended": 0,
        "token": "1535|cusalnrd79pvOpEDorYMISQOwQh3P22DrAzcMvE7835a8e31",
        "rememberToken": null,
        "deviceToken": null,
        "name": "John Doe"
      }
    commonErrors:
      - error: 400 Bad Request
        cause: Email already registered on this channel
        solution: Use a different email address
      - error: 422 Validation Error
        cause: Password does not meet requirements
        solution: Use password with 8+ characters, mixed case, numbers, special chars

  - id: register-customer-newsletter
    title: Register with Newsletter Subscription
    description: Create new customer and subscribe to newsletter.
    request: |
      POST /api/shop/customers
      Content-Type: application/json
      X-STOREFRONT-KEY: pk_storefront_PvlE42nWGsKRVIf8bDlJngTPAdWAZbIy

      {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "password": "SecurePass456!",
        "confirmPassword": "SecurePass456!",
        "phone": "9876543210",
        "gender": "Female",
        "dateOfBirth": "1990-05-20",
        "subscribedToNewsLetter": true
      }
    response: |
      {
        "id": 13,
        "firstName": "Jane",
        "lastName": "Smith",
        "gender": "Female",
        "dateOfBirth": "1990-05-20",
        "email": "jane@example.com",
        "phone": "9876543210",
        "status": 1,
        "apiToken": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9",
        "customerGroupId": 2,
        "channelId": 1,
        "subscribedToNewsLetter": true,
        "isVerified": 1,
        "isSuspended": 0,
        "token": "1536|hZq2YJGjxgcB1NHnAVGPHlUURp1SK5PnO5Btk4c7d1a90",
        "rememberToken": null,
        "deviceToken": null,
        "name": "Jane Smith"
      }
    commonErrors:
      - error: 409 Conflict
        cause: Customer email already exists on this channel
        solution: Use unique email or reset password instead
---

# Register Customer

Create a new customer account with email, password, and optional profile information.

## Endpoint

```
POST /api/shop/customers
```

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | application/json |
| `X-STOREFRONT-KEY` | Yes | Your storefront API key |

## Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "phone": "1234567890",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "subscribedToNewsLetter": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | Customer first name |
| `lastName` | string | Yes | Customer last name |
| `email` | string | Yes | Unique email address |
| `password` | string | Yes | Password (min 8 chars, mixed case, numbers, special) |
| `confirmPassword` | string | Yes | Password confirmation (must match) |
| `phone` | string | No | Phone number |
| `gender` | string | No | Customer gender (Male/Female) |
| `dateOfBirth` | string | No | Date of birth (YYYY-MM-DD) |
| `subscribedToNewsLetter` | boolean | No | Newsletter subscription (default: false) |

`status`, `isVerified` and `isSuspended` are optional and the value sent for them is not used. The server decides the account's state the way the web storefront sign-up does: `status` is `1` and `isSuspended` is `0`, and `isVerified` follows the store's **email verification** setting under Configuration → Customers → Settings → Email — `1` while it is switched off, `0` while it is switched on and the address has not been confirmed. An account with `isVerified` of `0` cannot sign in until the customer follows the link in the verification email.

The account's **channel** and **customer group** are not part of the request body. The server assigns them automatically — the channel from the request's storefront, and the store's default customer group — exactly as the web storefront sign-up does. They come back in the response as `channelId` and `customerGroupId`.

## Response Fields (201 Created)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Customer ID |
| `firstName` | string | Customer first name |
| `lastName` | string | Customer last name |
| `email` | string | Customer email |
| `phone` | string | Customer phone |
| `gender` | string | Customer gender |
| `dateOfBirth` | string | Customer date of birth |
| `apiToken` | string | Legacy field, kept for backward compatibility. **Not** an auth Bearer — authenticate with `token` instead |
| `token` | string | **The authentication credential** — send as `Authorization: Bearer <token>` |
| `status` | integer | Account status — `1` active, `0` inactive. An inactive account cannot sign in |
| `subscribedToNewsLetter` | boolean | Newsletter subscription status |
| `isVerified` | integer | Email verification state — `1` verified, `0` awaiting confirmation. An unverified account cannot sign in |
| `isSuspended` | integer | Suspension state — `0` not suspended, `1` suspended by an administrator |
| `name` | string | Full customer name |
| `customerGroupId` | integer | Customer group the account is placed in. Assigned automatically by the server (the store's default customer group) — not sent by the client. |
| `channelId` | integer | Channel the account is registered under. Assigned automatically from the request's storefront channel — not sent by the client. |
| `rememberToken` | mixed | Remember token |

## Password Requirements

Passwords must contain:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

## Related Resources

- [Customer Login](/api/rest-api/shop/customers/customer-login) — authenticate and receive a customer token
- [Update Profile](/api/rest-api/shop/customers/update-customer-profile) — patch name, email, phone, and other profile fields
- [Get Profile](/api/rest-api/shop/customers/get-customer-profile) — read the authenticated customer's account details
