# Setup & Configuration

Get the Bagisto API up and running in just a few minutes. Choose the installation method that works best for your setup.

## Prerequisites

Before installing, ensure you have:

- **Bagisto v2.4.x** ([Bagisto Installation Guide](https://devdocs.bagisto.com/getting-started/installation))
- **PHP 8.3+**
- **Composer 2.0+**

## Installation Methods

### Method 1: Quick Start (Composer Installation – Recommended)

The fastest way to get started:

```bash
# 1. Install the Bagisto API package
composer require bagisto/bagisto-api

# 2. Run the installer
php artisan bagisto-api-platform:install

```
Your APIs are now ready! Access them at:

- **API Documentation**: 
`https://your-domain.com/api`
<br>
 (e.g., [https://api-demo.bagisto.com/api](https://api-demo.bagisto.com/api))
 
### Method 2: Manual Installation

Use this method if you need more control over the setup.

#### Step 1: Download and Extract

1. Download the BagistoApi package from [GitHub](https://github.com/bagisto/bagisto-api)
2. Extract it to: `packages/Webkul/BagistoApi/`

#### Step 2: Register Service Provider

Edit `bootstrap/providers.php`:

```php
<?php

// ...existing imports...
use Webkul\BagistoApi\Providers\BagistoApiServiceProvider;
// ...rest of imports...

return [
    // ...existing providers...
    BagistoApiServiceProvider::class,
    // ...rest of providers...
];
```

#### Step 3: Update Autoloading

Edit `composer.json` and update the `autoload` section:

```json
{
  "autoload": {
    "psr-4": {
      "Webkul\\BagistoApi\\": "packages/Webkul/BagistoApi/src"
    }
  }
}
```

#### Step 4: Install Dependencies

Install the API Platform packages.

On **Bagisto 2.4.x**, the Laravel bridge and the GraphQL package bring in every other API Platform component at a matching version, so only these two are needed, together with the Symfony components they run on:

```bash
composer require -W \
  api-platform/laravel:~4.3.8 \
  api-platform/graphql:~4.3.8 \
  "symfony/property-access:^7.0" \
  "symfony/property-info:^7.1" \
  "symfony/serializer:^7.4.9" \
  "symfony/type-info:^7.3" \
  "symfony/validator:^7.0" \
  "symfony/web-link:^7.4"
```

#### Step 5: Run the installation
```bash
composer dump-autoload
php artisan bagisto-api-platform:install
```

#### Step 6: Environment Setup (Update in the .env)
```
STOREFRONT_DEFAULT_RATE_LIMIT=100
STOREFRONT_CACHE_TTL=60
STOREFRONT_KEY_PREFIX=storefront_key_
STOREFRONT_PLAYGROUND_KEY=pk_storefront_vxLIYv5PIp7jkujPNGLFQoDvIdsh2RMF 
API_PLAYGROUND_AUTO_INJECT_STOREFRONT_KEY=true
```

### Access Points

Once verified, access the APIs at:

- **API Documentation**: [https://your-domain.com/api](https://api-demo.bagisto.com/api)
- **REST API (Shop)**:  [https://your-domain.com/api/shop](https://api-demo.bagisto.com/api/shop)
- **REST API (Admin)**: [https://your-domain.com/api/admin](https://api-demo.bagisto.com/api/admin)
- **GraphQL Endpoint**: `https://your-domain.com/api/graphql`
- **GraphQL Playground**: [https://your-domain.com/api/graphiql](https://api-demo.bagisto.com/api/graphiql)


## Troubleshooting

### Provider Not Found

**Error**: `Class 'Webkul\BagistoApi\Providers\BagistoApiServiceProvider' not found`

**Solution**:
```bash
composer dump-autoload
php artisan cache:clear
php artisan config:clear
```

### 404 Errors on API Endpoints

**Error**: API endpoints return 404 Not Found

**Solutions**:
1. Ensure routes are published: `php artisan vendor:publish --tag=routes`
2. Clear route cache: `php artisan route:clear`
3. Check `.htaccess` file is present in your web root
4. Verify `APP_URL` in `.env` matches your domain

### Database Connection Errors

**Error**: `SQLSTATE[HY000]: General error: 1030 Got error`

**Solutions**:
1. Verify database credentials in `.env`
2. Run migrations: `php artisan migrate`
3. Check database encoding: `utf8mb4`
4. Ensure sufficient disk space

### Rate Limiting Issues

**Error**: `429 Too Many Requests`

Rate limits are **per credential**, not a global `.env` value:

- **Storefront (Shop API)** — each Storefront Key carries its own limit. Raise it when generating the key with `--rate-limit` (default 100/min, up to 5000, or `null` for unlimited), or rotate to a higher-limit key:
  ```bash
  php artisan bagisto-api:generate-key --name="High-Traffic App" --rate-limit=1000
  ```
  See [API Key Management](./storefront-api-key-management-guide) and the [Rate Limiting Guide](./rate-limiting).
- **Admin API** — each Integration token has a per-minute and per-day limit set in the **Integration** menu of the admin panel. Edit the token there (or issue a new one) to change its limits.

### CORS Errors in Browser

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
1. Verify CORS is configured in `config/cors.php`
2. Check `FRONTEND_URL` environment variable
3. Ensure `supports_credentials` is set properly
4. Clear browser cache

## Performance Optimization

Ensure the application is running in a production environment and that `APP_DEBUG` is set to `false`.

```bash
# Clear the API Platform metadata cache (run after adding or changing an endpoint)
php artisan bagisto-api-platform:clear-cache

# Rebuild + warm all caches for fast responses (run after every deploy or endpoint change)
php artisan bagisto-api-platform:optimize
```

## What's Next?

Ready to start using the APIs?

- 🔐 [Authentication Guide](./authentication) - Learn about authentication methods
- 🔗 [REST API Guide](./rest-api/introduction.html) - Explore REST API endpoints
- ⚡ [GraphQL API Guide](./graphql-api/introduction.html) - Discover GraphQL capabilities
- 🔑 [API Key Management](./storefront-api-key-management-guide) - Generate and manage API keys