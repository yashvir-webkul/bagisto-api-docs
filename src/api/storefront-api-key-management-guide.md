# Storefront API Key Management Guide

## Overview

Bagisto uses **storefront API keys** to identify the application calling your `/api/shop/*` and `/api/graphql` endpoints. The key says *which app* is calling — it never says *which person*, so customer-specific work still needs a customer Bearer token on top of it.

**Header Format:**
```
X-STOREFRONT-KEY: pk_storefront_xxxxxxxxxxxxx
```

**Quick Example:**
```bash
curl -X GET "https://your-domain.com/api/shop/products" \
  -H "X-STOREFRONT-KEY: pk_storefront_xxxxxxxxxxxxx"
```

## Key Management Notes

- **Public by design** — the key ships inside browser bundles and mobile apps, so treat it as identification rather than a secret. It is not a password.
- **Not read-only** — besides the catalog, the key alone permits the storefront's open writes: contact-us, newsletter subscribe, customer registration, and cart creation. See [Authentication](./authentication#the-key-is-not-read-only).
- **Customer operations** — use Bearer tokens (from customer login) for anything tied to an account.
- **Rate limited** — each key carries its own limit, enforced hourly. See [Understanding Rate Limits](#understanding-rate-limits).
- **Never expires by default** — a generated key stays valid until you rotate or deactivate it. Rotating issues a fresh key valid 12 months and leaves the old one working for a 7-day transition window.

---

## Quick Reference

| Task | Command |
|------|---------|
| Create new key | `php artisan bagisto-api:generate-key --name="My App"` |
| Check key status | `php artisan bagisto-api:key:manage status --key="My App"` |
| Rotate key | `php artisan bagisto-api:key:manage rotate --key="My App"` |
| Deactivate key | `php artisan bagisto-api:key:manage deactivate --key="Old Key"` |
| View all keys | `php artisan bagisto-api:key:manage summary` |
| Run maintenance | `php artisan bagisto-api:key:maintain --all` |

---

## Getting Started

### Step 1: Create Your First API Key

Run this command in your terminal:

```bash
php artisan bagisto-api:generate-key --name="My App"
```

**You'll see:**
```
Storefront key generated successfully!

Key Details:
  ID : 11
  Name : My App
  Key : pk_storefront_i7gWgB6A0TWNUV5s5eX2pOUV8JNOelrC
  Rate Limit : 100 requests/minute
  Status : Active

Keep this key secure! It will be used in X-STOREFRONT-KEY header.
Do not share this key publicly or commit it to version control.
```

Copy the key now — no command prints it again. `status` reports whether a key is active and when it was last used, but never its value.

The `Rate Limit` line is printed as "requests/minute", but the limit is applied per **hour** at request time. The number is right; the unit in that message is not. See [Understanding Rate Limits](#understanding-rate-limits).

### Step 2: Store the Key Safely

Add it to your `.env` file:
```bash
# .env file
BAGISTO_API_KEY=pk_storefront_xxxxxxxxxxxxx
```

Or store it in your secret manager (AWS Secrets Manager, HashiCorp Vault, etc.).

### Step 3: Start Making API Requests

**REST API Example:**
```bash
curl -X GET "https://your-domain.com/api/shop/products" \
  -H "X-STOREFRONT-KEY: pk_storefront_xxxxxxxxxxxxx"
```

**GraphQL API Example:**
```bash
curl -X POST "https://your-domain.com/api/graphql" \
  -H "X-STOREFRONT-KEY: pk_storefront_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products(first: 2) { edges { node { _id sku name } } } }"}'
```

**JavaScript/Node.js Example:**
```javascript
const apiKey = process.env.BAGISTO_API_KEY;

const response = await fetch('https://your-domain.com/api/shop/products', {
  method: 'GET',
  headers: {
    'X-STOREFRONT-KEY': apiKey,
    'Content-Type': 'application/json'
  }
});

const products = await response.json();
```

The header is `X-STOREFRONT-KEY` — hyphens, and `KEY` not `API`. A wrong header name reads as no key at all and returns `401`.

---

## Complete Command Reference

### Generate API Key

Create new API keys for different environments and applications.

```bash
php artisan bagisto-api:generate-key {--name=} {--rate-limit=100} {--no-activation}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` | string | prompted | Descriptive name for your key (e.g., "Mobile App", "Third Party"). Omit it and the command asks. Names must be unique — reusing one fails. |
| `--rate-limit` | integer | 100 | Requests per hour. Leave empty for unlimited; anything above 5,000 is capped at 5,000 with a warning. |
| `--no-activation` | flag | false | Create key in inactive state |

**Examples:**

```bash
# Basic key generation
php artisan bagisto-api:generate-key --name="Mobile App"

# Higher-traffic application
php artisan bagisto-api:generate-key --name="Partner API" --rate-limit=500

# Unlimited — pass an empty value
php artisan bagisto-api:generate-key --name="Premium Integration" --rate-limit=0

# Create inactive key (for later activation)
php artisan bagisto-api:generate-key --name="Staging Environment" --no-activation

# Above the ceiling: capped at 5,000 with a warning
php artisan bagisto-api:generate-key --name="Max Throughput" --rate-limit=10000
```

Pass `--rate-limit=` with nothing after it for unlimited. Writing `--rate-limit=null` sends the literal string `null`, which converts to `0` — which also means unlimited, but by accident rather than intent, so prefer the empty form.

**Tips:**
- **Name your keys clearly** — "Mobile App", "Website Frontend", "Partner Integration"
- **Match rate limits to your needs** — start with 100/hour and raise it as traffic grows
- **Rotate quarterly** — change keys every 3 months for security
- **Never commit to Git** — use `.env` files with `.gitignore`
- **Use one key per application** — a shared key cannot be revoked for one consumer without breaking the rest

---

### Finding and Identifying Keys

Keys can be referenced by either their **numeric ID** or **name** in all management commands:

```bash
# By ID (numeric)
php artisan bagisto-api:key:manage status --key=1

# By name (more convenient)
php artisan bagisto-api:key:manage status --key="Mobile App"

# Either approach works with any command:
php artisan bagisto-api:key:manage rotate --key="My Integration"
php artisan bagisto-api:key:manage deactivate --key=5
```

The system automatically detects whether you're using an ID or name and looks up the key accordingly.

---

## Manage API Keys

Monitor, rotate, and control your API keys throughout their lifecycle.

```bash
php artisan bagisto-api:key:manage {action} {--key=} {--reason=} {--days=7} {--unused=90}
```

**Available Actions:**

| Action | Purpose | Example |
|--------|---------|---------|
| `rotate` | Issue a replacement key and start the old one's transition period | `rotate --key="Mobile App"` |
| `deactivate` | Disable a key immediately | `deactivate --key="Old Key" --reason="Compromised"` |
| `status` | Check a key's validity and last use | `status --key="Mobile App"` |
| `expiring` | List keys expiring soon | `expiring --days=30` |
| `unused` | Find keys not used recently | `unused --unused=90` |
| `cleanup` | Soft-delete expired keys | `cleanup` |
| `summary` | Rotation-policy compliance overview | `summary` |

**Parameters:**

| Parameter | Type | Default | Applies to | Description |
|-----------|------|---------|-----------|-------------|
| `--key` | string | optional | rotate, deactivate, status | Key ID or name |
| `--reason` | string | optional | deactivate | Reason for deactivation (logged for audit) |
| `--days` | integer | 7 | `expiring` only | Days threshold |
| `--unused` | integer | 90 | `unused` only | Days threshold |

The two thresholds are not interchangeable. `unused --days=30` silently keeps the 90-day default, because `unused` reads `--unused`; the command still prints its real threshold in the heading (`Unused keys (> 90 days)`), so check that line rather than assuming your flag applied.

**Rotate and deactivate ask for confirmation.** Both prompt `Are you sure…? (yes/no) [no]`. In a cron job or deploy script the default answer is *no* and the command cancels, so pipe in a `yes` or run them interactively.

**Examples:**

```bash
# Rotate a key (security best practice)
php artisan bagisto-api:key:manage rotate --key="Mobile App"

# Deactivate a compromised key
php artisan bagisto-api:key:manage deactivate --key="Old Integration" \
  --reason="Service discontinued - replaced by new key"

# Check a key's status
php artisan bagisto-api:key:manage status --key="Mobile App"

# Find keys expiring within 30 days
php artisan bagisto-api:key:manage expiring --days=30

# Find keys unused for 90 days
php artisan bagisto-api:key:manage unused --unused=90

# View the compliance summary
php artisan bagisto-api:key:manage summary

# Soft-delete expired keys
php artisan bagisto-api:key:manage cleanup
```

**Output Examples:**

```
# Status output
Key Status: Mobile App

Active: ✅ Yes
Usable: ✅ Yes
Expired: ✅ No
Deprecated: ✅ No

Expires At: Never
Days Until Expiry: N/A
Last Used: 2026-08-14 12:41:02
```

```
# Summary output
API Key Rotation Policy Compliance Summary

Total Keys: 3
Valid Keys: 3
Expired Keys: 0
Deprecated Keys: 0
Keys Expiring Soon (7 days): 0
Unused Keys (90 days): 3
Recently Rotated (30 days): 0
```

Neither view reports per-key request counts. `Last Used` is the only usage signal, so track call volume from your own logs or the rate-limit headers if you need it.

### What Rotation Actually Does

Rotation is a hand-over, not a kill switch. Running it:

```
✅ Key rotated successfully!
Old Key: My App
Old Key ID: 11
Deprecation Date: 2026-08-21 13:07:06

New Key: My App (rotated 2026-08-14 13:07)
New Key ID: 13
New Key Value: pk_storefront_ekH7nWFO8erYJ838rJTLSpBZRz3MJzCT
Expires At: 2027-08-14 13:07:06
```

Three consequences worth planning around:

1. **The old key keeps working.** It is marked deprecated with a date 7 days out and stays valid through that window — deliberately, so clients have time to switch. It is disabled only when `key:maintain --invalidate` (or `--all`) runs *after* that date. If nothing runs that command, the old key never stops working. When you are rotating because a key leaked, deactivate it instead — that takes effect immediately.
2. **The new key is renamed.** It becomes `<old name> (rotated YYYY-MM-DD HH:MM)`, so `--key="My App"` afterwards still resolves to the **old** key. Use the new ID, or rename it, before scripting against it.
3. **The new key expires.** A generated key never expires, but a rotated one is given a 12-month expiry. A key created once and rotated annually will eventually expire on its own — watch it with `expiring`.

**Security Maintenance Schedule:**

| Frequency | Action | Command |
|-----------|--------|---------|
| **Monthly** | Review unused keys | `php artisan bagisto-api:key:manage unused --unused=90` |
| **Monthly** | Check expiring keys | `php artisan bagisto-api:key:manage expiring --days=30` |
| **Quarterly** | Rotate production keys | `php artisan bagisto-api:key:manage rotate --key="Production"` |
| **Immediately** | Kill a compromised key | `php artisan bagisto-api:key:manage deactivate --key="Old Key" --reason="Compromised"` |

---

### Automate Maintenance

Set up automatic cleanup, invalidation, and notifications.

```bash
php artisan bagisto-api:key:maintain {--cleanup} {--invalidate} {--notify} {--all}
```

**What Each Option Does:**

| Option | What It Does | When to Use |
|--------|-------------|-------------|
| `--cleanup` | Soft-deletes expired keys, keeping the row for audit | Scheduled daily maintenance |
| `--invalidate` | Disables rotated keys whose transition period has passed | Required for rotation to ever take effect |
| `--notify` | Sends expiration warnings | Proactive team notifications |
| `--all` | Runs all three | Comprehensive maintenance |

`--invalidate` is the part that finishes a rotation. Without it on a schedule, every key you have ever rotated is still accepting requests.

**Examples:**

```bash
# Clean up expired keys
php artisan bagisto-api:key:maintain --cleanup

# Send expiration notifications
php artisan bagisto-api:key:maintain --notify

# Run complete maintenance (recommended)
php artisan bagisto-api:key:maintain --all
```

**Output:**
```
🔄 Starting API Key Maintenance...

🧹 Cleaning up expired keys...
   ℹ️ No expired keys to clean up
⚠️ Invalidating deprecated keys...
   ℹ️ No deprecated keys to invalidate
📧 Sending expiration notifications...
   ℹ️ No keys requiring notifications

✅ API Key Maintenance Complete
```

**Recommended Scheduler Setup:**

Bagisto 2.4 runs on Laravel 12, where scheduled commands live in `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

// Daily maintenance: cleanup, invalidate, notify
Schedule::command('bagisto-api:key:maintain --all')
    ->daily()
    ->at('02:00')
    ->onOneServer();

// Weekly check for expiring keys
Schedule::command('bagisto-api:key:manage expiring --days=30')
    ->weeklyOn(1, '09:00');

// Monthly review of unused keys
Schedule::command('bagisto-api:key:manage unused --unused=90')
    ->monthlyOn(1, '10:00');
```

The scheduler itself must be running — `php artisan schedule:work` in development, or a cron entry calling `schedule:run` every minute in production.

---

## Security Best Practices

### Do This

- **Store in `.env`** — keep keys out of your codebase
  ```bash
  BAGISTO_API_KEY=pk_storefront_xxxxxxxxxxxxx
  ```

- **Use environment-specific keys** — different keys for dev/staging/production
  ```bash
  BAGISTO_API_KEY_DEV=pk_storefront_xxxxxxx
  BAGISTO_API_KEY_PROD=pk_storefront_yyyyyyy
  ```

- **Access via config** — use Laravel's config system
  ```php
  $apiKey = config('services.bagisto.api_key');
  ```

- **Rotate quarterly, deactivate on compromise** — rotation hands over gracefully; only deactivation stops a key now
  ```bash
  php artisan bagisto-api:key:manage rotate --key="Production"
  ```

- **Use secret managers** — AWS Secrets Manager, HashiCorp Vault, etc.

- **Schedule `key:maintain --all`** — otherwise rotated keys are never retired

### Don't Do This

- **Hardcode keys in source files**
- **Log API keys in error messages**
- **Share keys via email or chat**
- **Commit `.env` to Git**
- **Use the same key for multiple environments**
- **Assume rotation revoked the old key** — it stays valid for the transition period
- **Rely on the key as a security boundary** — it is public in any browser or mobile client

---

## Troubleshooting

### Key Rejected

The two rejections are different, and the status code tells you which:

| Status | Body | Meaning |
|---|---|---|
| `401` | `{"error": "missing_key"}` | No `X-STOREFRONT-KEY` header arrived — usually a misspelled header name |
| `403` | `{"error": "invalid_key"}` | A key arrived but is unknown, deactivated, expired, or soft-deleted |

```bash
# Check whether the key exists and is usable
php artisan bagisto-api:key:manage status --key="Your Key Name"
```

`Usable: ✅ Yes` is the line that decides it. A key can show `Deprecated: ❌ Yes` and still be usable — that is a rotated key inside its transition window.

### "Rate Limit Exceeded" Error

**Problem:** The key has used its hourly allowance.

**Symptoms:**
- HTTP `429`
- Body `{"message": "Rate limit exceeded", "error": "rate_limit_exceeded", "retry_after": 1421}`
- `retry_after` is **seconds until the next hour boundary**, so it can be far longer than a minute

The `429` response carries no `X-RateLimit-*` headers — those appear only on successful responses, so read the remaining count from those rather than expecting them on the rejection.

**Fixes:**

1. **Raise the limit** by issuing a key with more headroom:
   ```bash
   php artisan bagisto-api:generate-key --name="High Volume App" --rate-limit=2000
   ```
2. **Or an unlimited key**, for a trusted internal service:
   ```bash
   php artisan bagisto-api:generate-key --name="Internal Service" --rate-limit=
   ```
3. **Cache and batch** — the catalog endpoints are cacheable, and a paginated request costs one call instead of many.

An existing key's limit cannot be changed from the CLI; issue a new key with the limit you want.

### Lost or Exposed Key

**Immediate action** — deactivate, do not rotate. Deactivation takes effect on the next request; rotation leaves the leaked key alive for another 7 days.

```bash
php artisan bagisto-api:key:manage deactivate --key="My App" \
  --reason="Suspected compromise - exposed in logs"
```

Then issue a replacement and update your clients:

```bash
php artisan bagisto-api:generate-key --name="My App (New)"
```

### Key Created But Not Working

If the key was created with `--no-activation` it exists but is inactive, and every request returns `403`. `status` shows `Active: ❌ No`. There is no activate command — issue the key without the flag when you are ready to use it.

### Requests Working Locally But Not in Production

Check these in order:

1. **Different key?** — production and development should hold different keys; confirm which one is loaded.
2. **Environment variables?** — verify `.env` is loaded and the value is not null.
3. **Header name?** — `X-STOREFRONT-KEY`, not `X-STOREFRONT-API`. A wrong name gives `401 missing_key`.
4. **Inactive, expired, or deactivated key?** — `status --key="Production Key Name"`, and read the `Usable` line.
5. **Hourly limit hit?** — a `429` with a large `retry_after` means the hour's allowance is gone, not that you are calling too fast right now.
6. **Rotated recently?** — the new key carries a `(rotated …)` suffix in its name, so a script looking the key up by the old name is inspecting the wrong row.

---

## Understanding Rate Limits

Each key carries a limit that is applied **per clock hour**, despite the CLI describing it in minutes. A key created with `--rate-limit=100` allows 100 requests within the current hour; the counter resets at the top of the next hour, not 60 seconds after your first call.

### Rate Limit Fundamentals

- **Window** — the fixed clock hour. A key exhausted at 10:05 recovers at 11:00, and `retry_after` counts the seconds until then.
- **Default** — 100 requests per hour for a generated key.
- **Unlimited** — an empty or zero limit disables counting entirely.
- **Ceiling** — a requested limit above 5,000 is capped at 5,000 with a warning.
- **Exceeded** — HTTP `429` with `retry_after` in the body.

### Setting Rate Limits

```bash
# Default: 100 requests/hour
php artisan bagisto-api:generate-key --name="My App"

# Custom limit
php artisan bagisto-api:generate-key --name="High-Volume App" --rate-limit=2500

# Unlimited
php artisan bagisto-api:generate-key --name="Premium Partner" --rate-limit=

# Above the ceiling — capped at 5,000
php artisan bagisto-api:generate-key --name="Max Throughput" --rate-limit=10000
```

### Monitoring Rate Limit Usage

Successful responses carry three headers:

```bash
curl -X GET 'https://your-domain.com/api/shop/products' \
  -H 'X-STOREFRONT-KEY: pk_storefront_xxxxx' \
  -i
```

| Header | What it actually reports |
|---|---|
| `X-RateLimit-Remaining` | Calls left in the current hour for this key — the one to trust |
| `X-RateLimit-Reset` | **Seconds remaining** until the window resets, not a Unix timestamp |
| `X-RateLimit-Limit` | The store-wide configured default, **not** this key's limit |

`X-RateLimit-Limit` is the trap: a key limited to 3 still reports `X-RateLimit-Limit: 100`. Budget from `X-RateLimit-Remaining`, and treat the limit header as decoration.

### Handling Rate Limit Errors

```json
{
  "message": "Rate limit exceeded",
  "error": "rate_limit_exceeded",
  "retry_after": 1421
}
```

`retry_after` is already in seconds, so wait on it directly:

```javascript
if (response.status === 429) {
  const { retry_after } = await response.json();
  await sleep(retry_after * 1000);
  // retry request
}
```

Since the window is hourly, a naive retry loop can burn a long wait. Cache catalog responses, raise the key's limit, or split traffic across per-application keys instead of retrying into the same exhausted bucket.

### Rate Limiting Best Practices

**Do This:**
- Monitor `X-RateLimit-Remaining` rather than `X-RateLimit-Limit`
- Read `retry_after` from the body and honour it
- Cache catalog responses — they are the bulk of storefront traffic and they are cacheable
- Give each application its own key so one client's spike cannot exhaust another's budget
- Use unlimited keys only for internal, server-side services

**Don't Do This:**
- Retry immediately on a `429` — the window is an hour, not a minute
- Assume the reset header is a timestamp
- Set unlimited limits for external integrations
- Use one high-limit key for every application

## What's Next?

- [Rate Limiting Guide](./rate-limiting) — Understand and handle rate limits in detail
- [Authentication Guide](./authentication) — Learn about API authentication methods
- [REST API Guide](./rest-api/introduction.html) — Explore REST API endpoints
- [GraphQL API Guide](./graphql-api/introduction.html) — Discover GraphQL capabilities
- [Integration Guides](/api/integrations) — Client code for every supported language
