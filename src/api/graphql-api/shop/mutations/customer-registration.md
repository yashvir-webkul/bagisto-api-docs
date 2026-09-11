---
outline: false
examples:
  - id: customer-registration
    title: Customer Registration
    description: Register a new customer account with email and password.
    query: |
      mutation registerCustomer($input: createCustomerInput!) {
        createCustomer(input: $input) {
          customer {
            id
            _id
            token
            channelId
            customerGroupId
            dateOfBirth
            email
            gender
            isSuspended
            isVerified
            name
            firstName
            lastName
            rememberToken
            subscribedToNewsLetter
            status
            phone
          }
        }
      }
    variables: |
      {
        "input": {
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
      }
    response: |
      {
        "data": {
          "createCustomer": {
            "customer": {
              "id": "/api/shop/customers/1",
              "_id": 1,
              "channelId": "1",
              "customerGroupId": "2",
              "dateOfBirth": "1990-01-15",
              "email": "john.doe@example.com",
              "gender": "Male",
              "isSuspended": "0",
              "isVerified": "1",
              "name": "John Doe",
              "firstName": "John",
              "lastName": "Doe",
              "rememberToken": null,
              "subscribedToNewsLetter": true,
              "status": "1",
              "token": "1535|cusalnrd79pvOpEDorYMISQOwQh3P22DrAzcMvE7835a8e31",
              "phone": "5550123"
            }
          }
        }
      }

  - id: customer-registration-with-device-token
    title: Customer Registration with Device Token
    description: Register a new customer account and associate an FCM device token for push notifications. Only applicable if the Bagisto Push Notification package is installed.
    query: |
      mutation registerCustomer($input: createCustomerInput!) {
        createCustomer(input: $input) {
          customer {
            id
            _id
            token
            channelId
            customerGroupId
            dateOfBirth
            email
            gender
            isSuspended
            isVerified
            name
            firstName
            lastName
            rememberToken
            subscribedToNewsLetter
            status
            phone
            deviceToken
          }
        }
      }
    variables: |
      {
        "input": {
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
          "subscribedToNewsLetter": true,
          "deviceToken": "your_fcm_device_token"
        }
      }
    response: |
      {
        "data": {
          "createCustomer": {
            "customer": {
              "id": "/api/shop/customers/1",
              "_id": 1,
              "channelId": "1",
              "customerGroupId": "2",
              "dateOfBirth": "1990-01-15",
              "email": "john.doe@example.com",
              "gender": "Male",
              "isSuspended": "0",
              "isVerified": "1",
              "name": "John Doe",
              "firstName": "John",
              "lastName": "Doe",
              "rememberToken": null,
              "subscribedToNewsLetter": true,
              "status": "1",
              "token": "1535|cusalnrd79pvOpEDorYMISQOwQh3P22DrAzcMvE7835a8e31",
              "phone": "5550123",
              "deviceToken": "your_fcm_device_token"
            }
          }
        }
      }
---

# Customer Registration

Register a new customer account with Bagisto.

The `deviceToken` field applies only when the [Bagisto Push Notification](https://bagisto.com/en/extensions/push-notifications-for-bagisto/) package is installed. Pass the FCM device token here during registration to immediately associate the device with the new customer account for push notification delivery. If the package is not installed, this field can be omitted.

## Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | String | ✅ Yes | Customer's first name |
| `lastName` | String | ✅ Yes | Customer's last name |
| `email` | String | ✅ Yes | Customer's email address, unique within the channel being registered on |
| `password` | String | ✅ Yes | Password for the account (min. 8 characters) |
| `confirmPassword` | String | ✅ Yes | Must match `password` |
| `phone` | String | ❌ No | Customer's phone number |
| `gender` | String | ❌ No | Customer's gender (e.g. `Male`, `Female`) |
| `dateOfBirth` | String | ❌ No | Date of birth in `MM/DD/YYYY` format |
| `subscribedToNewsLetter` | Boolean | ❌ No | Opt-in to marketing emails. Default: `false` |
| `deviceToken` | String | ❌ No | FCM device token for push notifications. Only required if the [Bagisto Push Notification](https://bagisto.com/en/extensions/push-notifications-for-bagisto/) package is installed. |

`status`, `isVerified` and `isSuspended` are optional and the value sent for them is not used. The server decides the account's state the way the web storefront sign-up does: `status` is `1` and `isSuspended` is `0`, and `isVerified` follows the store's **email verification** setting under Configuration → Customers → Settings → Email — `1` while it is switched off, `0` while it is switched on and the address has not been confirmed. An account with `isVerified` of `0` cannot sign in until the customer follows the link in the verification email.

The account's **channel** and **customer group** are not arguments. The server assigns them automatically — the channel from the request's storefront, and the store's default customer group — exactly as the web storefront sign-up does. Select `channelId` and `customerGroupId` to read them back.

## Response

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID | IRI-style unique identifier (e.g. `/api/shop/customers/1`) |
| `_id` | Int | Numeric database ID |
| `email` | String | Registered email address |
| `firstName` | String | Customer's first name |
| `lastName` | String | Customer's last name |
| `name` | String | Full name (first + last) |
| `token` | String | Authentication token for use in subsequent requests |
| `status` | String | Account status — `1` active, `0` inactive. An inactive account cannot sign in |
| `isVerified` | String | Email verification state — `1` verified, `0` awaiting confirmation. An unverified account cannot sign in |
| `isSuspended` | String | Suspension state — `0` not suspended, `1` suspended by an administrator |
| `subscribedToNewsLetter` | Boolean | Newsletter subscription status |
| `gender` | String | Customer's gender |
| `dateOfBirth` | String | Customer's date of birth |
| `phone` | String | Customer's phone number |
| `channelId` | String | Channel the account is registered under. Assigned automatically from the request's storefront — not a client argument. |
| `customerGroupId` | String | Customer group the account is placed in (the store's default group). Assigned automatically — not a client argument. |
| `deviceToken` | String | Associated FCM device token (if Push Notification package is installed) |

## Token Usage

After registration, use the `token` in the `Authorization` header for authenticated requests:

```
Authorization: Bearer <token>
```
e.g.
```
"Authorization": "Bearer 1535|cusalnrd79pvOpEDorYMISQOwQh3P22DrAzcMvE7835a8e31"
```

## Validation Rules

- Email must be in valid format and unique within the channel being registered on — the same address may hold a separate account on each channel a store runs
- Password must be at least 8 characters
- `confirmPassword` must match `password`
- First name and last name are required

## Error Responses

```json
{
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Related Documentation

- [Customer Login](/api/graphql-api/shop/mutations/customer-login)
- [Customer Logout](/api/graphql-api/shop/mutations/customer-logout)
- [Authentication Guide](/api/graphql-api/authentication)
