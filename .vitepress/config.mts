import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { redirects, makeRedirectHtml } from './_redirects'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'
import { loadEnv } from 'vite'

// Helper: Escape HTML special characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Helper: Get language class for syntax highlighting
function getLanguageClass(label: string): string {
  const langMap: { [key: string]: string } = {
    'gql': 'graphql',
    'graphql': 'graphql',
    'curl': 'bash',
    'node': 'javascript',
    'node.js': 'javascript',
    'nodejs': 'javascript',
    'react': 'jsx',
    'ruby': 'ruby',
    'php': 'php'
  }
  return langMap[label.toLowerCase()] || label.toLowerCase()
}

// Helper: Parse tabs content
function parseTabsContent(content: string): Array<{ label: string; code: string }> {
  const tabs: Array<{ label: string; code: string }> = []
  
  // Split by == to find each tab section
  const sections = content.split(/^== /m)
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i]
    // First line is the label
    const lines = section.split('\n')
    const label = lines[0].trim()
    
    // Find code block
    const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/)
    if (codeMatch && codeMatch[1]) {
      tabs.push({
        label: label,
        code: codeMatch[1].trim()
      })
    }
  }

  return tabs
}

export default defineConfig(({ command, mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')

  return withMermaid({
  mermaid: {
    flowchart: { htmlLabels: false, useMaxWidth: false },
  },
  ignoreDeadLinks: true,
  lang: 'en-US',
  title: "Bagisto",
  description: "Bagisto Developer Documentation",
  
  vite: {
    server: {
      host: '0.0.0.0'
    },
    resolve: {
      alias: [
        {
          // Override VitePress's sidebar item to lift the depth-5 nesting cap
          // (deep menus like Marketing > Promotions > Catalog Rules > items).
          // Matches the relative `./VPSidebarItem.vue` import in VPSidebar.vue.
          find: /^.*\/VPSidebarItem\.vue$/,
          replacement: path.resolve(process.cwd(), '.vitepress/theme/components/VPSidebarItem.vue')
        }
      ]
    },
    define: {
      'import.meta.env.VITE_REST_API_URL': JSON.stringify(env.VITE_REST_API_URL),
      'import.meta.env.VITE_GRAPHQL_API_URL': JSON.stringify(env.VITE_GRAPHQL_API_URL)
    }
  },

  srcDir: './src',

  themeConfig: {
    siteTitle: false,

    logo: {
      light: '/logo.png',
      dark: '/logo-dark.png',
    },

    nav: [
      { text: 'Dev Docs', link: 'https://devdocs.bagisto.com/' },
      { text: 'User Guide', link: 'https://docs.bagisto.com/' },
      { text: 'Extensions', link: 'https://bagisto.com/en/extensions/' },
      { text: 'Community Forum', link: 'https://forums.bagisto.com/' },
      { text: 'Contact Us', link: 'https://bagisto.com/en/contacts/' }
    ],

    editLink: {
      pattern: 'https://github.com/bagisto/bagisto-api-docs/edit/master/src/:path',
      text: 'Help us improve this page on Github.'
    },

    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'full'
      }
    },

    sidebar: [
          {
            text: 'Getting Started',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/api/introduction' },
              { text: 'Setup', link: '/api/setup' },
              { text: 'Authentication', link: '/api/authentication' },
              { text: 'Storefront Keys', link: '/api/storefront-api-key-management-guide' },
            ],
          },
          {
            text: 'Core Concepts',
            collapsed: false,
            items: [
              { text: 'Rate Limiting', link: '/api/rate-limiting' },
              { text: 'Status Codes', link: '/api/errors' },
              { text: 'Pagination', link: '/api/pagination' },
              { text: 'Sorting', link: '/api/sorting' },
              { text: 'Integration Guides', link: '/api/integrations' },
              { text: 'Testing & Debugging', link: '/api/testing-debugging' },
            ],
          },
          {
            text: 'Build with AI',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/api/build-with-ai/' },
              { text: 'Agent Skills', link: '/api/build-with-ai/agent-skills' },
              { text: 'MCP Server', link: '/api/build-with-ai/mcp-server' },
            ],
          },
          {
            text: 'For Developers',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/api/for-developers/' },
              { text: 'Register Your Package', link: '/api/for-developers/register-your-package' },
              { text: 'Build an Endpoint', link: '/api/for-developers/build-an-endpoint' },
              { text: 'Write Endpoints', link: '/api/for-developers/write-endpoints' },
              { text: 'Conventions', link: '/api/for-developers/conventions' },
              { text: 'Test & Ship', link: '/api/for-developers/test-and-ship' },
            ],
          },
          {
            text: 'Workflows',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/api/workflows/' },
              {
                text: 'Shop',
                collapsed: true,
                link: '/api/workflows/shop/',
                items: [
                  { text: 'Overview', link: '/api/workflows/shop/' },
                  { text: 'Build a Storefront', link: '/api/workflows/shop/build-a-storefront' },
                  { text: 'Browse & Filter Catalog', link: '/api/workflows/shop/browse-and-filter-catalog' },
                  { text: 'Cart', link: '/api/workflows/shop/cart' },
                  { text: 'Checkout', link: '/api/workflows/shop/checkout' },
                  { text: 'Customer Account', link: '/api/workflows/shop/customer-account' },
                  { text: 'Returns / RMA', link: '/api/workflows/shop/returns-rma' },
                  { text: 'EU Withdrawal', link: '/api/workflows/shop/eu-withdrawal' },
                  { text: 'GDPR Requests', link: '/api/workflows/shop/gdpr' },
                ],
              },
              {
                text: 'Admin',
                collapsed: true,
                link: '/api/workflows/admin/',
                items: [
                  { text: 'Overview', link: '/api/workflows/admin/' },
                  { text: 'Build an Admin Dashboard', link: '/api/workflows/admin/build-an-admin-dashboard' },
                  { text: 'Create-Order Flow', link: '/api/workflows/admin/create-order-flow' },
                  { text: 'Product Management', link: '/api/workflows/admin/product-management' },
                  { text: 'Order Fulfillment Actions', link: '/api/workflows/admin/order-fulfillment-actions' },
                  { text: 'Customers (Impersonate & GDPR)', link: '/api/workflows/admin/customers' },
                  { text: 'Returns / RMA', link: '/api/workflows/admin/returns-rma' },
                  { text: 'EU Withdrawal', link: '/api/workflows/admin/eu-withdrawal' },
                  { text: 'Marketing', link: '/api/workflows/admin/marketing' },
                  { text: 'Configuration', link: '/api/workflows/admin/configuration' },
                ],
              },
              {
                text: 'Customization',
                collapsed: true,
                link: '/api/workflows/customization/',
                items: [
                  { text: 'Overview', link: '/api/workflows/customization/' },
                  { text: 'Folder Structure', link: '/api/workflows/customization/folder-structure' },
                  { text: 'Testing', link: '/api/workflows/customization/testing' },
                ],
              },
            ],
          },
          {
            text: 'GraphQL API',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/api/graphql-api/introduction' },
              { text: 'Authentication', link: '/api/graphql-api/authentication' },
              {
                text: 'Shop API',
                collapsed: true,
                items: [
                      {
                        text: 'Locales',
                        collapsed: true,
                        link: '/api/graphql-api/shop/locales/',
                        items: [     
                           {
                            text: 'Queries',
                            collapsed: true,
                            items: [               
                              { text: 'Locales', link: '/api/graphql-api/shop/locales/queries/locales' },
                              { text: 'Single Locale', link: '/api/graphql-api/shop/locales/queries/single-locale' }
                            ]
                          }
                        ]
                      },                      
                      {
                        text: 'Category',
                        collapsed: true,
                        link: '/api/graphql-api/shop/category/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Tree Categories', link: '/api/graphql-api/shop/queries/tree-categories' },  
                              { text: 'Categories', link: '/api/graphql-api/shop/queries/categories' },
                              { text: 'Single Category', link: '/api/graphql-api/shop/queries/get-category' },
                            ]
                          } 
                        ]
                      },
                      {
                        text: 'Features',
                        collapsed: true,
                        link: '/api/graphql-api/shop/features/',
                        items: [
                          { text: 'Storefront Features', link: '/api/graphql-api/shop/features/' }
                        ]
                      },
                      {
                        text: 'Theme',
                        collapsed: true,
                        link: '/api/graphql-api/shop/theme/',
                        items: [
                          { text: 'Theme', link: '/api/graphql-api/shop/theme/' }
                        ]
                      },
                      {
                        text: 'Sections',
                        collapsed: true,
                        link: '/api/graphql-api/shop/sections/',
                        items: [
                          { text: 'Sections', link: '/api/graphql-api/shop/sections/list' },
                          { text: 'Single Section', link: '/api/graphql-api/shop/sections/detail' }
                        ]
                      },
                      {
                        text: 'CMS Pages',
                        collapsed: true,
                        link: '/api/graphql-api/shop/cms-pages/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Pages', link: '/api/graphql-api/shop/queries/get-pages' },
                              { text: 'Single Page', link: '/api/graphql-api/shop/queries/get-page' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Product',
                        collapsed: true,
                        link: '/api/graphql-api/shop/product/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Products', link: '/api/graphql-api/shop/queries/get-products' },
                              { text: 'Search Products', link: '/api/graphql-api/shop/queries/search-products' },
                              { text: 'Category Attribute Filters', link: '/api/graphql-api/shop/queries/get-category-attribute-filters' },
                              { text: 'Single Product', link: '/api/graphql-api/shop/queries/get-product' },
                              { text: 'Booking Slots', link: '/api/graphql-api/shop/queries/get-booking-slots' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Product Review',
                        collapsed: true,
                        link: '/api/graphql-api/shop/product-review/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Product Reviews', link: '/api/graphql-api/shop/queries/get-product-reviews' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Product Review', link: '/api/graphql-api/shop/mutations/create-product-review' },
                              { text: 'Update Product Review', link: '/api/graphql-api/shop/mutations/update-product-review' },
                              { text: 'Delete Product Review', link: '/api/graphql-api/shop/mutations/delete-product-review' },

                            ]
                          }
                        ]
                      },
                      {
                        text: 'Attribute',
                        collapsed: true,
                        link: '/api/graphql-api/shop/attribute/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Attributes', link: '/api/graphql-api/shop/queries/get-attributes' },
                              { text: 'Single Attribute', link: '/api/graphql-api/shop/queries/get-attribute' },
                              { text: 'Attribute Options', link: '/api/graphql-api/shop/queries/get-attribute-options' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Channel',
                        collapsed: true,
                        link: '/api/graphql-api/shop/channel/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Channels', link: '/api/graphql-api/shop/queries/get-channels' },
                              { text: 'Single Channel', link: '/api/graphql-api/shop/queries/get-channel' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Currency',
                        collapsed: true,
                        link: '/api/graphql-api/shop/currency/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Currencies', link: '/api/graphql-api/shop/queries/get-currencies' },
                              { text: 'Single Currency', link: '/api/graphql-api/shop/queries/get-currency' },
                            ]
                          }
                        ]
                      },
                      { 
                        text: 'Country',
                        collapsed: true,
                        link: '/api/graphql-api/shop/country/',
                        items: [                    
                          { text: 'Single Country', link: '/api/graphql-api/shop/queries/get-country' },
                          { text: 'Countries', link: '/api/graphql-api/shop/queries/get-countries' },
                          { text: 'Country States', link: '/api/graphql-api/shop/queries/get-country-states' },
                          { text: 'Country State', link: '/api/graphql-api/shop/queries/get-country-state' }
                        ]
                      },  
                      {
                        text: 'Customer',
                        collapsed: true,
                        link: '/api/graphql-api/shop/customer/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Get Customer Profile', link: '/api/graphql-api/shop/queries/get-customer-profile' },
                              { text: 'Get Customer Orders', link: '/api/graphql-api/shop/queries/get-customer-orders' },
                              { text: 'Get Customer Order', link: '/api/graphql-api/shop/queries/get-customer-order' },
                              { text: 'Get Customer Order Shipments', link: '/api/graphql-api/shop/queries/get-customer-order-shipments' },
                              { text: 'Get Customer Order Shipment', link: '/api/graphql-api/shop/queries/get-customer-order-shipment' },
                              { text: 'Get Customer Invoices', link: '/api/graphql-api/shop/queries/get-customer-invoices' },
                              { text: 'Get Customer Invoice', link: '/api/graphql-api/shop/queries/get-customer-invoice' },
                              { text: 'Download Invoice', link: '/api/graphql-api/shop/queries/download-invoice' },
                              { text: 'Get Downloadable Products', link: '/api/graphql-api/shop/queries/get-customer-downloadable-products' },
                              { text: 'Get Downloadable Product', link: '/api/graphql-api/shop/queries/get-customer-downloadable-product' },
                              { text: 'Download Downloadable Product', link: '/api/graphql-api/shop/queries/download-downloadable-product' },
                              { text: 'Get Customer Addresses', link: '/api/graphql-api/shop/queries/get-customer-addresses' },
                            ]   

                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Customer Registration', link: '/api/graphql-api/shop/mutations/customer-registration' },
                              { text: 'Customer Login', link: '/api/graphql-api/shop/mutations/customer-login' },
                              { text: 'Social Login', link: '/api/graphql-api/shop/mutations/social-login' },
                              { text: 'Customer Verify Token', link: '/api/graphql-api/shop/mutations/customer-verify-token' },
                              { text: 'Customer Logout', link: '/api/graphql-api/shop/mutations/customer-logout' },
                              { text: 'Update Customer Profile', link: '/api/graphql-api/shop/mutations/update-customer-profile' },
                              { text: 'Delete Customer Profile', link: '/api/graphql-api/shop/mutations/delete-customer-profile' },
                              { text: 'Forgot Password', link: '/api/graphql-api/shop/mutations/forgot-password' },
                              { text: 'Create Customer Address', link: '/api/graphql-api/shop/mutations/create-customer-address' },
                              { text: 'Update Customer Address', link: '/api/graphql-api/shop/mutations/update-customer-address' },
                              { text: 'Delete Customer Address', link: '/api/graphql-api/shop/mutations/delete-customer-address' },
                              { text: 'Cancel Customer Order', link: '/api/graphql-api/shop/mutations/cancel-customer-order' },
                              { text: 'Reorder Customer Order', link: '/api/graphql-api/shop/mutations/reorder-customer-order' },
                              { text: 'Get Customer Reviews', link: '/api/graphql-api/shop/queries/get-customer-reviews' },
                              { text: 'Get Customer Review', link: '/api/graphql-api/shop/queries/get-customer-review' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'GDPR Requests',
                        collapsed: true,
                        link: '/api/graphql-api/shop/gdpr-requests/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'List GDPR Requests', link: '/api/graphql-api/shop/gdpr-requests/queries/list-gdpr-requests' },
                              { text: 'View GDPR Request', link: '/api/graphql-api/shop/gdpr-requests/queries/view-gdpr-request' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Raise GDPR Request', link: '/api/graphql-api/shop/gdpr-requests/mutations/create-gdpr-request' },
                              { text: 'Revoke GDPR Request', link: '/api/graphql-api/shop/gdpr-requests/mutations/revoke-gdpr-request' },
                              { text: 'Delete GDPR Request', link: '/api/graphql-api/shop/gdpr-requests/mutations/delete-gdpr-request' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Returns (RMA)',
                        collapsed: true,
                        link: '/api/graphql-api/shop/returns/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'List Returns', link: '/api/graphql-api/shop/returns/queries/list-returns' },
                              { text: 'View Return', link: '/api/graphql-api/shop/returns/queries/view-return' },
                              { text: 'List Returnable Orders', link: '/api/graphql-api/shop/returns/queries/list-returnable-orders' },
                              { text: 'List Returnable Items', link: '/api/graphql-api/shop/returns/queries/list-returnable-items' },
                              { text: 'List Return Reasons', link: '/api/graphql-api/shop/returns/queries/list-return-reasons' },
                              { text: 'List Return Custom Fields', link: '/api/graphql-api/shop/returns/queries/list-return-custom-fields' },
                              { text: 'List Return Messages', link: '/api/graphql-api/shop/returns/queries/list-return-messages' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Return', link: '/api/graphql-api/shop/returns/mutations/create-return' },
                              { text: 'Cancel Return', link: '/api/graphql-api/shop/returns/mutations/cancel-return' },
                              { text: 'Reopen Return', link: '/api/graphql-api/shop/returns/mutations/reopen-return' },
                              { text: 'Close Return', link: '/api/graphql-api/shop/returns/mutations/close-return' },
                              { text: 'Send Return Message', link: '/api/graphql-api/shop/returns/mutations/send-return-message' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'EU Withdrawal',
                        collapsed: true,
                        link: '/api/graphql-api/shop/eu-withdrawal/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'List EU Withdrawals', link: '/api/graphql-api/shop/eu-withdrawal/queries/list-eu-withdrawals' },
                              { text: 'View EU Withdrawal', link: '/api/graphql-api/shop/eu-withdrawal/queries/view-eu-withdrawal' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'File EU Withdrawal', link: '/api/graphql-api/shop/eu-withdrawal/mutations/create-eu-withdrawal' },
                              { text: 'File EU Withdrawal (Guest)', link: '/api/graphql-api/shop/eu-withdrawal/mutations/create-guest-eu-withdrawal' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Cart',
                        collapsed: true,
                        link: '/api/graphql-api/shop/cart/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Get Cart', link: '/api/graphql-api/shop/queries/get-cart' },
                            ]   

                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'CreateCart', link: '/api/graphql-api/shop/mutations/create-cart' },
                              { text: 'AddToCart', link: '/api/graphql-api/shop/mutations/add-to-cart' },
                              { text: 'UpdateCartItem', link: '/api/graphql-api/shop/mutations/update-cart-item' },
                              { text: 'RemoveCartItem', link: '/api/graphql-api/shop/mutations/remove-cart-item' },
                              { text: 'Merge Cart', link: '/api/graphql-api/shop/mutations/merge-cart' },
                              { text: 'Upload Customizable File', link: '/api/graphql-api/shop/mutations/upload-customizable-file' },
                              { text: 'ApplyCoupon', link: '/api/graphql-api/shop/mutations/apply-coupon' },
                              { text: 'RemoveCoupon', link: '/api/graphql-api/shop/mutations/remove-coupon' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Checkout',
                        collapsed: true,
                        link: '/api/graphql-api/shop/checkout/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Get Addresses', link: '/api/graphql-api/shop/queries/get-addresses' },
                              { text: 'Get Shipping Methods', link: '/api/graphql-api/shop/queries/get-shipping-methods' },
                              { text: 'Get Payment Methods', link: '/api/graphql-api/shop/queries/get-payment-methods' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Set Checkout Address', link: '/api/graphql-api/shop/mutations/set-billing-address' },
                              { text: 'Set Shipping Method', link: '/api/graphql-api/shop/mutations/set-shipping-method' },
                              { text: 'Set Payment Method', link: '/api/graphql-api/shop/mutations/set-payment-method' },
                              { text: 'Place Order', link: '/api/graphql-api/shop/mutations/place-order' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Wishlist',
                        collapsed: true,
                        link: '/api/graphql-api/shop/wishlist/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Get Wishlists', link: '/api/graphql-api/shop/queries/get-wishlists' },
                              { text: 'Get Wishlist Item', link: '/api/graphql-api/shop/queries/get-wishlist' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Wishlist', link: '/api/graphql-api/shop/mutations/create-wishlist' },
                              { text: 'Toggle Wishlist', link: '/api/graphql-api/shop/mutations/toggle-wishlist' },
                              { text: 'Delete Wishlist', link: '/api/graphql-api/shop/mutations/delete-wishlist' },
                              { text: 'Move to Cart', link: '/api/graphql-api/shop/mutations/move-wishlist-to-cart' },
                              { text: 'Delete All Wishlists', link: '/api/graphql-api/shop/mutations/delete-all-wishlists' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Compare',
                        collapsed: true,
                        link: '/api/graphql-api/shop/compare/',
                        items: [
                          {
                            text: 'Queries',
                            collapsed: true,
                            items: [
                              { text: 'Get Compare Items', link: '/api/graphql-api/shop/queries/get-compare-items' },
                              { text: 'Get Compare Item', link: '/api/graphql-api/shop/queries/get-compare-item' },
                            ]
                          },
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Compare Item', link: '/api/graphql-api/shop/mutations/create-compare-item' },
                              { text: 'Delete Compare Item', link: '/api/graphql-api/shop/mutations/delete-compare-item' },
                              { text: 'Delete All Compare Items', link: '/api/graphql-api/shop/mutations/delete-all-compare-items' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Contact Us',
                        collapsed: true,
                        link: '/api/graphql-api/shop/contact-us/',
                        items: [
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Contact Us', link: '/api/graphql-api/shop/mutations/create-contact-us' },
                            ]
                          }
                        ]
                      },
                      {
                        text: 'Newsletter',
                        collapsed: true,
                        link: '/api/graphql-api/shop/newsletter/',
                        items: [
                          {
                            text: 'Mutations',
                            collapsed: true,
                            items: [
                              { text: 'Create Newsletter', link: '/api/graphql-api/shop/mutations/create-newsletter' },
                            ]
                          }
                        ]
                      },
                ]
              },
              {
                text: 'Admin API',
                collapsed: true,
                items: [
                  { text: 'Authentication', link: '/api/graphql-api/admin/authentication' },
                  {
                    text: 'Admin Profile',
                    collapsed: true,
                    items: [
                      { text: 'Get Profile', link: '/api/graphql-api/admin/profile/get-profile' },
                    ]
                  },
                  {
                    text: 'Navigation',
                    collapsed: true,
                    items: [
                      { text: 'Menu', link: '/api/graphql-api/admin/navigation/menu' },
                      { text: 'Permissions', link: '/api/graphql-api/admin/navigation/permissions' },
                    ]
                  },
                  {
                    text: 'Catalog',
                    collapsed: true,
                    items: [
                      {
                        text: 'Products',
                        link: '/api/graphql-api/admin/catalog/products/',
                        collapsed: true,
                        items: [
                          { text: 'List Products', link: '/api/graphql-api/admin/catalog/products' },
                          { text: 'Add-Product Search (Create-Order)', link: '/api/graphql-api/admin/catalog/products/list' },
                          { text: 'Catalog Product Detail', link: '/api/graphql-api/admin/catalog/products/products-detail' },
                          { text: 'Create Product', link: '/api/graphql-api/admin/catalog/products/create' },
                          { text: 'Update Product', link: '/api/graphql-api/admin/catalog/products/update' },
                          { text: 'Delete Product', link: '/api/graphql-api/admin/catalog/products/delete' },
                          { text: 'Copy Product', link: '/api/graphql-api/admin/catalog/products/copy' },
                          { text: 'Mass Delete Products', link: '/api/graphql-api/admin/catalog/products/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/catalog/products/mass-update-status' },
                          { text: 'Upload Image (REST only)', link: '/api/graphql-api/admin/catalog/products/images-upload' },
                          { text: 'Update Image', link: '/api/graphql-api/admin/catalog/products/images-update' },
                          { text: 'Reorder Images', link: '/api/graphql-api/admin/catalog/products/images-reorder' },
                          { text: 'Delete Image', link: '/api/graphql-api/admin/catalog/products/images-delete' },
                          { text: 'List Inventories', link: '/api/graphql-api/admin/catalog/products/inventories-list' },
                          { text: 'Update Inventories', link: '/api/graphql-api/admin/catalog/products/inventories-update' },
                          { text: 'List Customer-Group Prices', link: '/api/graphql-api/admin/catalog/products/customer-group-prices-list' },
                          { text: 'Add Customer-Group Price', link: '/api/graphql-api/admin/catalog/products/customer-group-prices-create' },
                          { text: 'Update Customer-Group Price', link: '/api/graphql-api/admin/catalog/products/customer-group-prices-update' },
                          { text: 'Delete Customer-Group Price', link: '/api/graphql-api/admin/catalog/products/customer-group-prices-delete' },
                        ]
                      },
                      {
                        text: 'Categories',
                        link: '/api/graphql-api/admin/catalog/categories/',
                        collapsed: true,
                        items: [
                          { text: 'Categories Listing (Datagrid)', link: '/api/graphql-api/admin/catalog/categories/categories-listing' },
                          { text: 'Categories Tree (Nested)', link: '/api/graphql-api/admin/catalog/categories/categories-tree' },
                          { text: 'Category Detail', link: '/api/graphql-api/admin/catalog/categories/categories-detail' },
                          { text: 'Create Category', link: '/api/graphql-api/admin/catalog/categories/categories-create' },
                          { text: 'Update / Move Category', link: '/api/graphql-api/admin/catalog/categories/categories-update' },
                          { text: 'Delete Category', link: '/api/graphql-api/admin/catalog/categories/categories-delete' },
                          { text: 'Mass Delete Categories', link: '/api/graphql-api/admin/catalog/categories/categories-mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/catalog/categories/categories-mass-update-status' },
                        ]
                      },
                      {
                        text: 'Attributes',
                        link: '/api/graphql-api/admin/catalog/attributes/',
                        collapsed: true,
                        items: [
                          { text: 'Attributes Listing (Datagrid)', link: '/api/graphql-api/admin/catalog/attributes/attributes-listing' },
                          { text: 'Attribute Detail', link: '/api/graphql-api/admin/catalog/attributes/attributes-detail' },
                          { text: 'Create Attribute', link: '/api/graphql-api/admin/catalog/attributes/attributes-create' },
                          { text: 'Update Attribute', link: '/api/graphql-api/admin/catalog/attributes/attributes-update' },
                          { text: 'Delete Attribute', link: '/api/graphql-api/admin/catalog/attributes/attributes-delete' },
                          { text: 'Mass Delete Attributes', link: '/api/graphql-api/admin/catalog/attributes/attributes-mass-delete' },
                          { text: 'Attribute Options (CRUD)', link: '/api/graphql-api/admin/catalog/attributes/attribute-options' },
                        ]
                      },
                      {
                        text: 'Attribute Families',
                        link: '/api/graphql-api/admin/catalog/families/',
                        collapsed: true,
                        items: [
                          { text: 'Families Listing (Datagrid)', link: '/api/graphql-api/admin/catalog/families/families-listing' },
                          { text: 'Family Detail', link: '/api/graphql-api/admin/catalog/families/families-detail' },
                          { text: 'Create Family', link: '/api/graphql-api/admin/catalog/families/families-create' },
                          { text: 'Update Family', link: '/api/graphql-api/admin/catalog/families/families-update' },
                          { text: 'Delete Family', link: '/api/graphql-api/admin/catalog/families/families-delete' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Appearance',
                    link: '/api/graphql-api/admin/appearance/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Themes',
                        link: '/api/graphql-api/admin/appearance/themes/',
                        collapsed: true,
                        items: [
                          { text: 'adminAppearanceThemes', link: '/api/graphql-api/admin/appearance/themes/list' },
                          { text: 'adminAppearanceTheme', link: '/api/graphql-api/admin/appearance/themes/detail' },
                          { text: 'adminAppearanceThemeImpact', link: '/api/graphql-api/admin/appearance/themes/impact' },
                          { text: 'createAdminAppearanceThemeActivate', link: '/api/graphql-api/admin/appearance/themes/activate' },
                        ]
                      },
                      {
                        text: 'Sections',
                        link: '/api/graphql-api/admin/appearance/sections/',
                        collapsed: true,
                        items: [
                          { text: 'adminAppearanceSections', link: '/api/graphql-api/admin/appearance/sections/list' },
                          { text: 'adminAppearanceSection', link: '/api/graphql-api/admin/appearance/sections/detail' },
                          { text: 'createAdminAppearanceSection', link: '/api/graphql-api/admin/appearance/sections/create' },
                          { text: 'updateAdminAppearanceSection', link: '/api/graphql-api/admin/appearance/sections/update' },
                          { text: 'deleteAdminAppearanceSection', link: '/api/graphql-api/admin/appearance/sections/delete' },
                          { text: 'createAdminAppearanceSectionDraft', link: '/api/graphql-api/admin/appearance/sections/draft' },
                          { text: 'createAdminAppearanceSectionStatus', link: '/api/graphql-api/admin/appearance/sections/status' },
                          { text: 'createAdminAppearanceSectionReorder', link: '/api/graphql-api/admin/appearance/sections/reorder' },
                          { text: 'createAdminAppearanceSectionDuplicate', link: '/api/graphql-api/admin/appearance/sections/duplicate' },
                          { text: 'createAdminAppearanceSectionPublish', link: '/api/graphql-api/admin/appearance/sections/publish' },
                          { text: 'createAdminAppearanceSectionDiscard', link: '/api/graphql-api/admin/appearance/sections/discard' },
                          { text: 'adminAppearanceSectionFields', link: '/api/graphql-api/admin/appearance/sections/fields' },
                          { text: 'adminAppearanceSectionPreview', link: '/api/graphql-api/admin/appearance/sections/preview' },
                        ]
                      },
                    ]
                  },
                  {
                    text: 'CMS',
                    link: '/api/graphql-api/admin/cms/pages/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Queries',
                        collapsed: true,
                        items: [
                          { text: 'List Pages', link: '/api/graphql-api/admin/cms/pages/queries/list' },
                          { text: 'Page Detail', link: '/api/graphql-api/admin/cms/pages/queries/detail' },
                        ]
                      },
                      {
                        text: 'Mutations',
                        collapsed: true,
                        items: [
                          { text: 'Create Page', link: '/api/graphql-api/admin/cms/pages/mutations/create' },
                          { text: 'Update Page', link: '/api/graphql-api/admin/cms/pages/mutations/update' },
                          { text: 'Delete Page', link: '/api/graphql-api/admin/cms/pages/mutations/delete' },
                          { text: 'Mass Delete Pages', link: '/api/graphql-api/admin/cms/pages/mutations/mass-delete' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Sales',
                    link: '/api/graphql-api/admin/sales/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Orders',
                        link: '/api/graphql-api/admin/sales/orders/',
                        collapsed: true,
                        items: [
                          { text: 'List Orders', link: '/api/graphql-api/admin/sales/orders/list-orders' },
                          { text: 'Order Detail', link: '/api/graphql-api/admin/sales/orders/order-detail' },
                          { text: 'Reorder', link: '/api/graphql-api/admin/sales/orders/reorder' },
                          { text: 'Cancel Order', link: '/api/graphql-api/admin/sales/orders/cancel' },
                          { text: 'Add Comment', link: '/api/graphql-api/admin/sales/orders/add-comment' },
                          { text: 'List Comments', link: '/api/graphql-api/admin/sales/orders/list-comments' },
                          { text: 'Create Invoice', link: '/api/graphql-api/admin/sales/orders/create-invoice' },
                          { text: 'Get Invoice', link: '/api/graphql-api/admin/sales/orders/get-invoice' },
                          { text: 'Print Invoice (PDF)', link: '/api/graphql-api/admin/sales/orders/print-invoice' },
                          { text: 'Send Duplicate Invoice', link: '/api/graphql-api/admin/sales/orders/send-duplicate-invoice' },
                          { text: 'Create Shipment', link: '/api/graphql-api/admin/sales/orders/create-shipment' },
                          { text: 'Get Shipment', link: '/api/graphql-api/admin/sales/orders/get-shipment' },
                          { text: 'Create Refund', link: '/api/graphql-api/admin/sales/orders/create-refund' },
                          { text: 'Refund Preview', link: '/api/graphql-api/admin/sales/orders/refund-preview' },
                          { text: 'Get Refund', link: '/api/graphql-api/admin/sales/orders/get-refund' },
                        ]
                      },
                      {
                        text: 'Carts',
                        collapsed: true,
                        items: [
                          { text: 'Get Cart', link: '/api/graphql-api/admin/sales/carts/get-cart' },
                          { text: 'Add Item', link: '/api/graphql-api/admin/sales/carts/add-item' },
                          { text: 'Update Items', link: '/api/graphql-api/admin/sales/carts/update-items' },
                          { text: 'Remove Item', link: '/api/graphql-api/admin/sales/carts/remove-item' },
                          { text: 'Save Address', link: '/api/graphql-api/admin/sales/carts/save-address' },
                          { text: 'Apply Coupon', link: '/api/graphql-api/admin/sales/carts/apply-coupon' },
                          { text: 'Remove Coupon', link: '/api/graphql-api/admin/sales/carts/remove-coupon' },
                          { text: 'List Shipping Methods', link: '/api/graphql-api/admin/sales/carts/list-shipping-methods' },
                          { text: 'Set Shipping Method', link: '/api/graphql-api/admin/sales/carts/set-shipping-method' },
                          { text: 'List Payment Methods', link: '/api/graphql-api/admin/sales/carts/list-payment-methods' },
                          { text: 'Set Payment Method', link: '/api/graphql-api/admin/sales/carts/set-payment-method' },
                          { text: 'Place Order', link: '/api/graphql-api/admin/sales/carts/place-order' },
                        ]
                      },
                      {
                        text: 'Invoices (Datagrid)',
                        link: '/api/graphql-api/admin/sales/invoices/',
                        collapsed: true,
                        items: [
                          { text: 'List Invoices', link: '/api/graphql-api/admin/sales/invoices/list' },
                          { text: 'Get Invoice', link: '/api/graphql-api/admin/sales/orders/get-invoice' },
                          { text: 'Print Invoice (PDF)', link: '/api/graphql-api/admin/sales/orders/print-invoice' },
                          { text: 'Send Duplicate Invoice', link: '/api/graphql-api/admin/sales/orders/send-duplicate-invoice' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/sales/invoices/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Shipments (Datagrid)',
                        link: '/api/graphql-api/admin/sales/shipments/',
                        collapsed: true,
                        items: [
                          { text: 'List Shipments', link: '/api/graphql-api/admin/sales/shipments/list' },
                          { text: 'Get Shipment', link: '/api/graphql-api/admin/sales/orders/get-shipment' },
                        ]
                      },
                      {
                        text: 'Refunds (Datagrid)',
                        link: '/api/graphql-api/admin/sales/refunds/',
                        collapsed: true,
                        items: [
                          { text: 'List Refunds', link: '/api/graphql-api/admin/sales/refunds/list' },
                          { text: 'Get Refund', link: '/api/graphql-api/admin/sales/orders/get-refund' },
                        ]
                      },
                      {
                        text: 'Returns (RMA)',
                        link: '/api/graphql-api/admin/sales/returns/',
                        collapsed: true,
                        items: [
                          { text: 'List Returns', link: '/api/graphql-api/admin/sales/returns/queries/list-returns' },
                          { text: 'View Return', link: '/api/graphql-api/admin/sales/returns/queries/view-return' },
                          { text: 'Returnable Items', link: '/api/graphql-api/admin/sales/returns/queries/list-returnable-items' },
                          { text: 'Return Reasons', link: '/api/graphql-api/admin/sales/returns/queries/list-return-reasons' },
                          { text: 'Return Messages', link: '/api/graphql-api/admin/sales/returns/queries/list-return-messages' },
                          { text: 'Create Return', link: '/api/graphql-api/admin/sales/returns/mutations/create-return' },
                          { text: 'Update Status', link: '/api/graphql-api/admin/sales/returns/mutations/update-status' },
                          { text: 'Reopen Return', link: '/api/graphql-api/admin/sales/returns/mutations/reopen-return' },
                          { text: 'Send Return Message', link: '/api/graphql-api/admin/sales/returns/mutations/send-return-message' },
                        ]
                      },
                      {
                        text: 'EU Withdrawal',
                        link: '/api/graphql-api/admin/sales/eu-withdrawal/',
                        collapsed: true,
                        items: [
                          { text: 'List EU Withdrawals', link: '/api/graphql-api/admin/sales/eu-withdrawal/queries/list-eu-withdrawals' },
                          { text: 'View EU Withdrawal', link: '/api/graphql-api/admin/sales/eu-withdrawal/queries/view-eu-withdrawal' },
                          { text: 'Decline', link: '/api/graphql-api/admin/sales/eu-withdrawal/mutations/decline' },
                          { text: 'Mark Refunded', link: '/api/graphql-api/admin/sales/eu-withdrawal/mutations/mark-refunded' },
                          { text: 'Resend Confirmation', link: '/api/graphql-api/admin/sales/eu-withdrawal/mutations/resend-confirmation' },
                        ]
                      },
                      {
                        text: 'Transactions',
                        collapsed: true,
                        items: [
                          { text: 'List Transactions', link: '/api/graphql-api/admin/sales/transactions/list' },
                          { text: 'Create Transaction', link: '/api/graphql-api/admin/sales/transactions/create' },
                        ]
                      },
                      {
                        text: 'Bookings',
                        link: '/api/graphql-api/admin/sales/bookings/',
                        collapsed: true,
                        items: [
                          { text: 'List Bookings', link: '/api/graphql-api/admin/sales/bookings/list' },
                          { text: 'Booking Detail', link: '/api/graphql-api/admin/sales/bookings/detail' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Customers',
                    link: '/api/graphql-api/admin/customers/',
                    collapsed: true,
                    items: [
                      { text: 'List Customers', link: '/api/graphql-api/admin/customers/main/list' },
                      { text: 'Customer Detail', link: '/api/graphql-api/admin/customers/main/detail' },
                      { text: 'Create Customer', link: '/api/graphql-api/admin/customers/main/create' },
                      { text: 'Update Customer', link: '/api/graphql-api/admin/customers/main/update' },
                      { text: 'Delete Customer', link: '/api/graphql-api/admin/customers/main/delete' },
                      { text: 'Mass Delete', link: '/api/graphql-api/admin/customers/main/mass-delete' },
                      { text: 'Mass Update Status', link: '/api/graphql-api/admin/customers/main/mass-update-status' },
                      {
                        text: 'Addresses',
                        link: '/api/graphql-api/admin/customers/addresses/',
                        collapsed: true,
                        items: [
                          { text: 'List Addresses', link: '/api/graphql-api/admin/customers/addresses' },
                          { text: 'Address Detail', link: '/api/graphql-api/admin/customers/addresses/detail' },
                          { text: 'Create Address', link: '/api/graphql-api/admin/customers/addresses/create' },
                          { text: 'Update Address', link: '/api/graphql-api/admin/customers/addresses/update' },
                          { text: 'Delete Address', link: '/api/graphql-api/admin/customers/addresses/delete' },
                          { text: 'Set as Default', link: '/api/graphql-api/admin/customers/addresses/set-default' },
                        ]
                      },
                      {
                        text: 'Notes',
                        link: '/api/graphql-api/admin/customers/notes/',
                        collapsed: true,
                        items: [
                          { text: 'Add Note', link: '/api/graphql-api/admin/customers/notes/create' },
                          { text: 'List Notes', link: '/api/graphql-api/admin/customers/notes/list' },
                        ]
                      },
                      {
                        text: 'Impersonate',
                        link: '/api/graphql-api/admin/customers/impersonate/',
                        collapsed: true,
                        items: [
                          { text: 'Issue Impersonation Token', link: '/api/graphql-api/admin/customers/impersonate/create' },
                        ]
                      },
                      {
                        text: 'Customer Groups',
                        link: '/api/graphql-api/admin/customers/groups/',
                        collapsed: true,
                        items: [
                          { text: 'List Groups', link: '/api/graphql-api/admin/customers/groups/list' },
                          { text: 'Group Detail', link: '/api/graphql-api/admin/customers/groups/detail' },
                          { text: 'Create Group', link: '/api/graphql-api/admin/customers/groups/create' },
                          { text: 'Update Group', link: '/api/graphql-api/admin/customers/groups/update' },
                          { text: 'Delete Group', link: '/api/graphql-api/admin/customers/groups/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/customers/groups/mass-delete' },
                        ]
                      },
                      {
                        text: 'Reviews',
                        link: '/api/graphql-api/admin/customers/reviews/',
                        collapsed: true,
                        items: [
                          { text: 'List Reviews', link: '/api/graphql-api/admin/customers/reviews/list' },
                          { text: 'Review Detail', link: '/api/graphql-api/admin/customers/reviews/detail' },
                          { text: 'Review with Images', link: '/api/graphql-api/admin/customers/reviews/review-with-images' },
                          { text: 'Update Status', link: '/api/graphql-api/admin/customers/reviews/update' },
                          { text: 'Delete Review', link: '/api/graphql-api/admin/customers/reviews/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/customers/reviews/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/customers/reviews/mass-update-status' },
                        ]
                      },
                      {
                        text: 'GDPR Requests',
                        link: '/api/graphql-api/admin/customers/gdpr/',
                        collapsed: true,
                        items: [
                          { text: 'List Requests', link: '/api/graphql-api/admin/customers/gdpr/list' },
                          { text: 'Request Detail', link: '/api/graphql-api/admin/customers/gdpr/detail' },
                          { text: 'Update Request', link: '/api/graphql-api/admin/customers/gdpr/update' },
                          { text: 'Delete Request', link: '/api/graphql-api/admin/customers/gdpr/delete' },
                          { text: 'Process (Approve + Execute)', link: '/api/graphql-api/admin/customers/gdpr/process' },
                          { text: 'Download Data Export', link: '/api/graphql-api/admin/customers/gdpr/download-data' },
                        ]
                      },
                      {
                        text: 'Create-Order Helpers',
                        link: '/api/graphql-api/admin/customers/create-order-helpers/',
                        collapsed: true,
                        items: [
                          { text: 'Active Cart Items', link: '/api/graphql-api/admin/customers/active-cart-items' },
                          { text: 'Wishlist Items', link: '/api/graphql-api/admin/customers/wishlist-items' },
                          { text: 'Compare Items', link: '/api/graphql-api/admin/customers/compare-items' },
                          { text: 'Recent Order Items', link: '/api/graphql-api/admin/customers/recent-order-items' },
                          { text: 'Create Draft Cart', link: '/api/graphql-api/admin/customers/create-draft-cart' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Settings',
                    link: '/api/graphql-api/admin/settings/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Locales',
                        link: '/api/graphql-api/admin/settings/locales/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/locales/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/locales/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/locales/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/locales/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/locales/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/locales/mass-delete' },
                        ]
                      },
                      {
                        text: 'Currencies',
                        link: '/api/graphql-api/admin/settings/currencies/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/currencies/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/currencies/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/currencies/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/currencies/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/currencies/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/currencies/mass-delete' },
                        ]
                      },
                      {
                        text: 'Exchange Rates',
                        link: '/api/graphql-api/admin/settings/exchange-rates/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/exchange-rates/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/exchange-rates/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/exchange-rates/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/exchange-rates/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/exchange-rates/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/exchange-rates/mass-delete' },
                          { text: 'Update Rates', link: '/api/graphql-api/admin/settings/exchange-rates/update-rates' },
                        ]
                      },
                      {
                        text: 'Inventory Sources',
                        link: '/api/graphql-api/admin/settings/inventory-sources/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/inventory-sources/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/inventory-sources/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/inventory-sources/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/inventory-sources/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/inventory-sources/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/inventory-sources/mass-delete' },
                        ]
                      },
                      {
                        text: 'Channels',
                        link: '/api/graphql-api/admin/settings/channels/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/channels/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/channels/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/channels/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/channels/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/channels/delete' },
                        ]
                      },
                      {
                        text: 'Admin Users',
                        link: '/api/graphql-api/admin/settings/users/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/users/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/users/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/users/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/users/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/users/delete' },
                          { text: 'Delete My Account', link: '/api/graphql-api/admin/settings/users/delete-self' },
                        ]
                      },
                      {
                        text: 'Roles',
                        link: '/api/graphql-api/admin/settings/roles/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/roles/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/roles/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/roles/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/roles/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/roles/delete' },
                        ]
                      },
                      {
                        text: 'Tax Categories',
                        link: '/api/graphql-api/admin/settings/tax-categories/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/tax-categories/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/tax-categories/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/tax-categories/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/tax-categories/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/tax-categories/delete' },
                        ]
                      },
                      {
                        text: 'Tax Rates',
                        link: '/api/graphql-api/admin/settings/tax-rates/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/tax-rates/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/tax-rates/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/tax-rates/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/tax-rates/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/tax-rates/delete' },
                        ]
                      },
                      {
                        text: 'Return Reasons',
                        link: '/api/graphql-api/admin/settings/return-reasons/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/return-reasons/queries/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/return-reasons/queries/get' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/return-reasons/mutations/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/return-reasons/mutations/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/return-reasons/mutations/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/return-reasons/mutations/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/settings/return-reasons/mutations/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Rules',
                        link: '/api/graphql-api/admin/settings/return-rules/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/return-rules/queries/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/return-rules/queries/get' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/return-rules/mutations/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/return-rules/mutations/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/return-rules/mutations/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/return-rules/mutations/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/settings/return-rules/mutations/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Statuses',
                        link: '/api/graphql-api/admin/settings/return-statuses/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/return-statuses/queries/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/return-statuses/queries/get' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/return-statuses/mutations/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/return-statuses/mutations/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/return-statuses/mutations/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/return-statuses/mutations/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/settings/return-statuses/mutations/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Custom Fields',
                        link: '/api/graphql-api/admin/settings/return-custom-fields/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/graphql-api/admin/settings/return-custom-fields/queries/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/return-custom-fields/queries/get' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/return-custom-fields/mutations/create' },
                          { text: 'Update', link: '/api/graphql-api/admin/settings/return-custom-fields/mutations/update' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/return-custom-fields/mutations/delete' },
                          { text: 'Mass Delete', link: '/api/graphql-api/admin/settings/return-custom-fields/mutations/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/graphql-api/admin/settings/return-custom-fields/mutations/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Data Transfer Imports',
                        link: '/api/graphql-api/admin/settings/data-transfer-imports/overview',
                        collapsed: true,
                        items: [
                          { text: 'Overview', link: '/api/graphql-api/admin/settings/data-transfer-imports/overview' },
                          { text: 'List', link: '/api/graphql-api/admin/settings/data-transfer-imports/list' },
                          { text: 'Detail', link: '/api/graphql-api/admin/settings/data-transfer-imports/detail' },
                          { text: 'Create', link: '/api/graphql-api/admin/settings/data-transfer-imports/create' },
                          { text: 'Validate', link: '/api/graphql-api/admin/settings/data-transfer-imports/validate' },
                          { text: 'Start', link: '/api/graphql-api/admin/settings/data-transfer-imports/start' },
                          { text: 'Link', link: '/api/graphql-api/admin/settings/data-transfer-imports/link' },
                          { text: 'Index', link: '/api/graphql-api/admin/settings/data-transfer-imports/index' },
                          { text: 'Stats', link: '/api/graphql-api/admin/settings/data-transfer-imports/stats' },
                          { text: 'Delete', link: '/api/graphql-api/admin/settings/data-transfer-imports/delete' },
                          { text: 'Cancel', link: '/api/graphql-api/admin/settings/data-transfer-imports/cancel' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Dashboard',
                    link: '/api/graphql-api/admin/dashboard/',
                    collapsed: true,
                    items: [
                      { text: 'Statistics', link: '/api/graphql-api/admin/dashboard/stats' },
                    ]
                  },
                  {
                    text: 'Reporting',
                    link: '/api/graphql-api/admin/reporting/',
                    collapsed: true,
                    items: [
                      { text: 'Overview', link: '/api/graphql-api/admin/reporting/overview' },
                      { text: 'Sales', link: '/api/graphql-api/admin/reporting/sales' },
                      { text: 'Customers', link: '/api/graphql-api/admin/reporting/customers' },
                      { text: 'Products', link: '/api/graphql-api/admin/reporting/products' },
                    ]
                  },
                  {
                    text: 'Marketing',
                    link: '/api/graphql-api/admin/marketing/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Promotions',
                        link: '/api/graphql-api/admin/marketing/promotions/',
                        collapsed: true,
                        items: [
                          {
                            text: 'Catalog Rules',
                            link: '/api/graphql-api/admin/marketing/promotions/catalog-rules/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/promotions/catalog-rules-mass-delete' },
                            ]
                          },
                          {
                            text: 'Cart Rules',
                            link: '/api/graphql-api/admin/marketing/promotions/cart-rules/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-detail' },
                              { text: 'Copy', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-copy' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/promotions/cart-rules-mass-delete' },
                            ]
                          },
                          {
                            text: 'Cart Rule Coupons',
                            link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons-list' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons-create' },
                              { text: 'Bulk Generate', link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons-generate' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/promotions/cart-rule-coupons-mass-delete' },
                            ]
                          },
                        ]
                      },
                      {
                        text: 'Communications',
                        link: '/api/graphql-api/admin/marketing/communications/',
                        collapsed: true,
                        items: [
                          {
                            text: 'Email Templates',
                            link: '/api/graphql-api/admin/marketing/communications/templates/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/communications/templates-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/communications/templates-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/communications/templates-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/communications/templates-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/communications/templates-delete' },
                            ]
                          },
                          {
                            text: 'Events',
                            link: '/api/graphql-api/admin/marketing/communications/events/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/communications/events-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/communications/events-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/communications/events-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/communications/events-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/communications/events-delete' },
                            ]
                          },
                          {
                            text: 'Campaigns',
                            link: '/api/graphql-api/admin/marketing/communications/campaigns/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/communications/campaigns-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/communications/campaigns-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/communications/campaigns-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/communications/campaigns-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/communications/campaigns-delete' },
                              { text: 'Send', link: '/api/graphql-api/admin/marketing/communications/campaigns-send' },
                            ]
                          },
                          {
                            text: 'Newsletter Subscribers',
                            link: '/api/graphql-api/admin/marketing/communications/subscribers/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/communications/subscribers-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/communications/subscribers-detail' },
                              { text: 'Toggle Subscription', link: '/api/graphql-api/admin/marketing/communications/subscribers-toggle' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/communications/subscribers-delete' },
                            ]
                          },
                        ]
                      },
                      {
                        text: 'Search SEO',
                        link: '/api/graphql-api/admin/marketing/search-seo/',
                        collapsed: true,
                        items: [
                          {
                            text: 'URL Rewrites',
                            link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/search-seo/url-rewrites-mass-delete' },
                            ]
                          },
                          {
                            text: 'Search Terms',
                            link: '/api/graphql-api/admin/marketing/search-seo/search-terms/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/search-seo/search-terms-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/search-seo/search-terms-detail' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/search-seo/search-terms-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/search-seo/search-terms-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/search-seo/search-terms-mass-delete' },
                            ]
                          },
                          {
                            text: 'Search Synonyms',
                            link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-delete' },
                              { text: 'Mass Delete', link: '/api/graphql-api/admin/marketing/search-seo/search-synonyms-mass-delete' },
                            ]
                          },
                          {
                            text: 'Sitemaps',
                            link: '/api/graphql-api/admin/marketing/search-seo/sitemaps/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-list' },
                              { text: 'Detail', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-detail' },
                              { text: 'Create', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-create' },
                              { text: 'Update', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-update' },
                              { text: 'Delete', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-delete' },
                              { text: 'Regenerate', link: '/api/graphql-api/admin/marketing/search-seo/sitemaps-generate' },
                            ]
                          },
                        ]
                      },
                    ]
                  },
                  {
                    text: 'Configuration',
                    collapsed: true,
                    link: '/api/graphql-api/admin/configuration/',
                    items: [
                      { text: 'Menu', link: '/api/graphql-api/admin/configuration/menu' },
                      { text: 'Slugs', link: '/api/graphql-api/admin/configuration/slugs' },
                      { text: 'Values', link: '/api/graphql-api/admin/configuration/values' },
                      { text: 'Update', link: '/api/graphql-api/admin/configuration/update' },
                    ]
                  }
                ]
              },
              { text: 'Identifiers (id, _id, IRI)', link: '/api/graphql-api/identifiers' },
              { text: 'Playground Guide', link: '/api/graphql-api/playground' },
              { text: 'Best Practices', link: '/api/graphql-api/best-practices' },
            ]
          },
          { 
            text: 'Rest API',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/api/rest-api/introduction' },
              { text: 'Authentication', link: '/api/rest-api/authentication' },

              {
                text: 'Shop API',
                collapsed: true,
                items: [
                  {
                    text: 'Locales',
                    collapsed: true,
                    link: '/api/rest-api/shop/locales/',
                    items: [ 
                      { text: 'Get All Locales', link: '/api/rest-api/shop/locales/get-locales' },
                      { text: 'Get Single Locale', link: '/api/rest-api/shop/locales/get-single-locale' }
                    ]
                  },
                  {
                    text: 'Categories',
                    collapsed: true,
                    link: '/api/rest-api/shop/categories/',
                    items: [
                          { text: 'Categories', link: '/api/rest-api/shop/categories/get-categories' },
                          { text: 'Category Tree', link: '/api/rest-api/shop/categories/get-category-tree' },
                    ]
                  },
                  {
                    text: 'Features',
                    collapsed: true,
                    link: '/api/rest-api/shop/features/',
                    items: [
                          { text: 'Get Storefront Features', link: '/api/rest-api/shop/features/' },
                    ]
                  },
                  {
                    text: 'Theme',
                    collapsed: true,
                    link: '/api/rest-api/shop/theme/',
                    items: [
                          { text: 'Get Theme', link: '/api/rest-api/shop/theme/' },
                    ]
                  },
                  {
                    text: 'Sections',
                    collapsed: true,
                    link: '/api/rest-api/shop/sections/',
                    items: [
                          { text: 'List Sections', link: '/api/rest-api/shop/sections/list' },
                          { text: 'Get Section', link: '/api/rest-api/shop/sections/detail' },
                    ]
                  },
                  {
                    text: 'Products',
                    collapsed: true,
                    link: '/api/rest-api/shop/products/',
                    items: [
                          { text: 'Products', link: '/api/rest-api/shop/products/get-products' },
                          { text: 'Search Products', link: '/api/rest-api/shop/products/search-product' },
                          { text: 'Single Product', link: '/api/rest-api/shop/products/get-product' },
                          { text: 'Booking Slots', link: '/api/rest-api/shop/products/get-booking-slots' },
                          { text: 'Product Sub-Resources', link: '/api/rest-api/shop/products/product-subresources' },
                          { text: 'Product Type Sub-Resources', link: '/api/rest-api/shop/products/product-type-subresources' },
                    ]
                  },
                  {
                    text: 'Product Review',
                    collapsed: true,
                    link: '/api/rest-api/shop/product-reviews/',
                    items: [
                          { text: 'Get Product Reviews', link: '/api/rest-api/shop/product-reviews/get-product-reviews' },
                          { text: 'Get Product Review', link: '/api/rest-api/shop/product-reviews/get-product-review' },
                          { text: 'Create Product Review', link: '/api/rest-api/shop/product-reviews/create-product-review' },
                          { text: 'Update Product Review', link: '/api/rest-api/shop/product-reviews/update-product-review' },
                          { text: 'Delete Product Review', link: '/api/rest-api/shop/product-reviews/delete-product-review' },
                    ]
                  },
                  {
                    text: 'Attribute',
                    collapsed: true,
                    link: '/api/rest-api/shop/attributes/',
                    items: [
                          { text: 'Attributes', link: '/api/rest-api/shop/attributes/get-attributes' },
                          { text: 'Attribute Options', link: '/api/rest-api/shop/attributes/get-attribute-options' },
                          { text: 'Attribute Translations', link: '/api/rest-api/shop/attributes/get-attribute-translations' },
                    ]
                  },
                  {
                    text: 'Channel',
                    collapsed: true,
                    link: '/api/rest-api/shop/channels/',
                    items: [
                          { text: 'Channels', link: '/api/rest-api/shop/channels/get-channels' },
                          { text: 'Channel Translations', link: '/api/rest-api/shop/channels/get-channel-translations' },
                    ]
                  },
                  {
                    text: 'Country and State',
                    collapsed: true,
                    link: '/api/rest-api/shop/countries/',
                    items: [
                          { text: 'Countries', link: '/api/rest-api/shop/countries/get-countries' },
                          { text: 'Country States', link: '/api/rest-api/shop/countries/get-country-states' },
                    ]
                  },
                  {
                    text: 'Customer',
                    collapsed: true,
                    link: '/api/rest-api/shop/customers/',
                    items: [
                          { text: 'Registration', link: '/api/rest-api/shop/customers/customer-registration' },
                          { text: 'Login', link: '/api/rest-api/shop/customers/customer-login' },
                          { text: 'Social Login', link: '/api/rest-api/shop/customers/social-login' },
                          { text: 'Verify Token', link: '/api/rest-api/shop/customers/customer-verify-token' },
                          { text: 'Customer Logout', link: '/api/rest-api/shop/customers/customer-logout' },
                          { text: 'Forgot Password', link: '/api/rest-api/shop/customers/forgot-password' },
                          { text: 'Change Password', link: '/api/rest-api/shop/customers/change-password' },
                          { text: 'Get Addresses', link: '/api/rest-api/shop/customers/get-customer-addresses'},                               
                          { text: 'Create Address', link: '/api/rest-api/shop/customers/create-customer-address' },
                          { text: 'Update Address', link: '/api/rest-api/shop/customers/update-customer-address' },
                          { text: 'Delete Address', link: '/api/rest-api/shop/customers/delete-customer-address' },
                          { text: 'Get Profile', link: '/api/rest-api/shop/customers/get-customer-profile' },
                          { text: 'Update Profile', link: '/api/rest-api/shop/customers/update-customer-profile' },
                          { text: 'Delete Profile', link: '/api/rest-api/shop/customers/delete-customer-profile' },
                          { text: 'Get Orders', link: '/api/rest-api/shop/customer-orders/get-customer-orders' },
                          { text: 'Get Order', link: '/api/rest-api/shop/customer-orders/get-customer-order' },
                          { text: 'Get Invoices', link: '/api/rest-api/shop/customer-invoices/get-customer-invoices' },
                          { text: 'Get Invoice', link: '/api/rest-api/shop/customer-invoices/get-customer-invoice' },
                          { text: 'Download Invoice PDF', link: '/api/rest-api/shop/customer-invoices/download-customer-invoice-pdf' },
                          { text: 'Get Downloadable Products', link: '/api/rest-api/shop/customer-downloadable-products/get-customer-downloadable-products' },
                          { text: 'Get Downloadable Product', link: '/api/rest-api/shop/customer-downloadable-products/get-customer-downloadable-product' },
                          { text: 'Download Downloadable Product', link: '/api/rest-api/shop/customer-downloadable-products/download-customer-downloadable-product' },
                          { text: 'Get Customer Reviews', link: '/api/rest-api/shop/customer-reviews/get-customer-reviews' },
                          { text: 'Get Customer Review', link: '/api/rest-api/shop/customer-reviews/get-customer-review' },
                    ]
                  },
                  {
                    text: 'GDPR Requests',
                    collapsed: true,
                    link: '/api/rest-api/shop/gdpr-requests/',
                    items: [
                          { text: 'List GDPR Requests', link: '/api/rest-api/shop/gdpr-requests/list-gdpr-requests' },
                          { text: 'View GDPR Request', link: '/api/rest-api/shop/gdpr-requests/view-gdpr-request' },
                          { text: 'Raise GDPR Request', link: '/api/rest-api/shop/gdpr-requests/create-gdpr-request' },
                          { text: 'Revoke GDPR Request', link: '/api/rest-api/shop/gdpr-requests/revoke-gdpr-request' },
                          { text: 'Delete GDPR Request', link: '/api/rest-api/shop/gdpr-requests/delete-gdpr-request' },
                    ]
                  },
                  {
                    text: 'Returns (RMA)',
                    collapsed: true,
                    link: '/api/rest-api/shop/returns/',
                    items: [
                          { text: 'List Returns', link: '/api/rest-api/shop/returns/list-returns' },
                          { text: 'View Return', link: '/api/rest-api/shop/returns/view-return' },
                          { text: 'Create Return', link: '/api/rest-api/shop/returns/create-return' },
                          { text: 'Cancel Return', link: '/api/rest-api/shop/returns/cancel-return' },
                          { text: 'Reopen Return', link: '/api/rest-api/shop/returns/reopen-return' },
                          { text: 'Close Return', link: '/api/rest-api/shop/returns/close-return' },
                          { text: 'List Returnable Orders', link: '/api/rest-api/shop/returns/list-returnable-orders' },
                          { text: 'List Returnable Items', link: '/api/rest-api/shop/returns/list-returnable-items' },
                          { text: 'List Return Reasons', link: '/api/rest-api/shop/returns/list-return-reasons' },
                          { text: 'List Return Custom Fields', link: '/api/rest-api/shop/returns/list-return-custom-fields' },
                          { text: 'List Return Messages', link: '/api/rest-api/shop/returns/list-return-messages' },
                          { text: 'Send Return Message', link: '/api/rest-api/shop/returns/send-return-message' },
                    ]
                  },
                  {
                    text: 'EU Withdrawal',
                    collapsed: true,
                    link: '/api/rest-api/shop/eu-withdrawal/',
                    items: [
                          { text: 'List EU Withdrawals', link: '/api/rest-api/shop/eu-withdrawal/list-eu-withdrawals' },
                          { text: 'View EU Withdrawal', link: '/api/rest-api/shop/eu-withdrawal/view-eu-withdrawal' },
                          { text: 'File EU Withdrawal', link: '/api/rest-api/shop/eu-withdrawal/create-eu-withdrawal' },
                          { text: 'File EU Withdrawal (Guest)', link: '/api/rest-api/shop/eu-withdrawal/create-guest-eu-withdrawal' },
                    ]
                  },
                  {
                    text: 'Cart',
                    collapsed: true,
                    link: '/api/rest-api/shop/cart/',
                    items: [
                          { text: 'Get Cart', link: '/api/rest-api/shop/cart/get-cart' },
                          { text: 'Create Cart', link: '/api/rest-api/shop/cart/create-cart' },
                          { text: 'Add to Cart', link: '/api/rest-api/shop/cart/add-to-cart' },
                          { text: 'Update Cart Item', link: '/api/rest-api/shop/cart/update-cart-item' },
                          { text: 'Remove Cart Item', link: '/api/rest-api/shop/cart/remove-cart-item' },
                          { text: 'Apply Coupon', link: '/api/rest-api/shop/cart/apply-coupon' },
                          { text: 'Remove Coupon', link: '/api/rest-api/shop/cart/remove-coupon' },
                          { text: 'Merge Cart', link: '/api/rest-api/shop/cart/merge-cart' },
                          { text: 'Upload Customizable File', link: '/api/rest-api/shop/cart/upload-customizable-file' },
                    ]
                  },
                  {
                    text: 'Checkout',
                    collapsed: true,
                    link: '/api/rest-api/shop/checkout/',
                    items: [
                          { text: 'Get Addresses', link: '/api/rest-api/shop/checkout/get-addresses' },
                          { text: 'Get Shipping Methods', link: '/api/rest-api/shop/checkout/get-shipping-methods' },
                          { text: 'Get Payment Methods', link: '/api/rest-api/shop/checkout/get-payment-methods' },
                          { text: 'Set Shipping Address', link: '/api/rest-api/shop/checkout/set-shipping-address' },
                          { text: 'Set Billing Address', link: '/api/rest-api/shop/checkout/set-billing-address' },
                          { text: 'Set Shipping Method', link: '/api/rest-api/shop/checkout/set-shipping-method' },
                          { text: 'Set Payment Method', link: '/api/rest-api/shop/checkout/set-payment-method'},                               
                          { text: 'Place Order', link: '/api/rest-api/shop/checkout/place-order' },
                    ]
                  },
                  {
                    text: 'Wishlist',
                    collapsed: true,
                    link: '/api/rest-api/shop/wishlist/',
                    items: [
                      { text: 'Get Wishlist Items', link: '/api/rest-api/shop/wishlist/list' },
                      { text: 'Create Wishlist Item', link: '/api/rest-api/shop/wishlist/create' },
                      { text: 'Toggle Wishlist Item', link: '/api/rest-api/shop/wishlist/toggle' },
                      { text: 'Delete Wishlist Item', link: '/api/rest-api/shop/wishlist/delete' },
                      { text: 'Delete All Wishlist Items', link: '/api/rest-api/shop/wishlist/delete-all' },
                      { text: 'Move Wishlist Item to Cart', link: '/api/rest-api/shop/wishlist/move-to-cart' },
                    ]
                  },
                  {
                    text: 'Compare',
                    collapsed: true,
                    link: '/api/rest-api/shop/compare/',
                    items: [
                      { text: 'Get Compare Items', link: '/api/rest-api/shop/compare/list' },
                      { text: 'Get Compare Item', link: '/api/rest-api/shop/compare/get' },
                      { text: 'Create Compare Item', link: '/api/rest-api/shop/compare/create' },
                      { text: 'Delete Compare Item', link: '/api/rest-api/shop/compare/delete' },
                      { text: 'Delete All Compare Items', link: '/api/rest-api/shop/compare/delete-all' },
                    ]
                  },
                  {
                    text: 'Contact Us',
                    collapsed: true,
                    link: '/api/rest-api/shop/contact-us/',
                    items: [
                      { text: 'Submit an Enquiry', link: '/api/rest-api/shop/contact-us/submit-contact-us' },
                    ]
                  },
                  {
                    text: 'Newsletter',
                    collapsed: true,
                    link: '/api/rest-api/shop/newsletter/',
                    items: [
                      { text: 'Subscribe to Newsletter', link: '/api/rest-api/shop/newsletter/subscribe' },
                    ]
                  },
                ]
              },
              {
                text: 'Admin API',
                collapsed: true,
                items: [
                  { text: 'Authentication', link: '/api/rest-api/admin/authentication' },
                  {
                    text: 'Admin Profile',
                    collapsed: true,
                    items: [
                      { text: 'Get Profile', link: '/api/rest-api/admin/profile/get-profile' },
                    ]
                  },
                  {
                    text: 'Navigation',
                    collapsed: true,
                    items: [
                      { text: 'Menu', link: '/api/rest-api/admin/navigation/menu' },
                      { text: 'Permissions', link: '/api/rest-api/admin/navigation/permissions' },
                    ]
                  },
                  {
                    text: 'Catalog',
                    collapsed: true,
                    items: [
                      {
                        text: 'Products',
                        link: '/api/rest-api/admin/catalog/products/',
                        collapsed: true,
                        items: [
                          { text: 'List Products', link: '/api/rest-api/admin/catalog/products' },
                          { text: 'Add-Product Search (Create-Order)', link: '/api/rest-api/admin/catalog/products/list' },
                          { text: 'Catalog Product Detail', link: '/api/rest-api/admin/catalog/products/products-detail' },
                          { text: 'Create Product', link: '/api/rest-api/admin/catalog/products/create' },
                          { text: 'Update Product', link: '/api/rest-api/admin/catalog/products/update' },
                          { text: 'Delete Product', link: '/api/rest-api/admin/catalog/products/delete' },
                          { text: 'Copy Product', link: '/api/rest-api/admin/catalog/products/copy' },
                          { text: 'Mass Delete Products', link: '/api/rest-api/admin/catalog/products/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/catalog/products/mass-update-status' },
                          { text: 'Export Products (CSV)', link: '/api/rest-api/admin/catalog/products/export' },
                          { text: 'Upload Image', link: '/api/rest-api/admin/catalog/products/images-upload' },
                          { text: 'Update Image', link: '/api/rest-api/admin/catalog/products/images-update' },
                          { text: 'Reorder Images', link: '/api/rest-api/admin/catalog/products/images-reorder' },
                          { text: 'Delete Image', link: '/api/rest-api/admin/catalog/products/images-delete' },
                          { text: 'Upload Downloadable File', link: '/api/rest-api/admin/catalog/products/downloadable-upload' },
                          { text: 'Download Downloadable File', link: '/api/rest-api/admin/catalog/products/downloadable-download' },
                          { text: 'Upload Video', link: '/api/rest-api/admin/catalog/products/videos-upload' },
                          { text: 'Delete Video', link: '/api/rest-api/admin/catalog/products/videos-delete' },
                          { text: 'List Inventories', link: '/api/rest-api/admin/catalog/products/inventories-list' },
                          { text: 'Update Inventories', link: '/api/rest-api/admin/catalog/products/inventories-update' },
                          { text: 'List Customer-Group Prices', link: '/api/rest-api/admin/catalog/products/customer-group-prices-list' },
                          { text: 'Add Customer-Group Price', link: '/api/rest-api/admin/catalog/products/customer-group-prices-create' },
                          { text: 'Update Customer-Group Price', link: '/api/rest-api/admin/catalog/products/customer-group-prices-update' },
                          { text: 'Delete Customer-Group Price', link: '/api/rest-api/admin/catalog/products/customer-group-prices-delete' },
                        ]
                      },
                      {
                        text: 'Categories',
                        link: '/api/rest-api/admin/catalog/categories/',
                        collapsed: true,
                        items: [
                          { text: 'Categories Listing (Datagrid)', link: '/api/rest-api/admin/catalog/categories/categories-listing' },
                          { text: 'Categories Tree (Nested)', link: '/api/rest-api/admin/catalog/categories/categories-tree' },
                          { text: 'Category Detail', link: '/api/rest-api/admin/catalog/categories/categories-detail' },
                          { text: 'Create Category', link: '/api/rest-api/admin/catalog/categories/categories-create' },
                          { text: 'Update / Move Category', link: '/api/rest-api/admin/catalog/categories/categories-update' },
                          { text: 'Delete Category', link: '/api/rest-api/admin/catalog/categories/categories-delete' },
                          { text: 'Mass Delete Categories', link: '/api/rest-api/admin/catalog/categories/categories-mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/catalog/categories/categories-mass-update-status' },
                        ]
                      },
                      {
                        text: 'Attributes',
                        link: '/api/rest-api/admin/catalog/attributes/',
                        collapsed: true,
                        items: [
                          { text: 'Attributes Listing (Datagrid)', link: '/api/rest-api/admin/catalog/attributes/attributes-listing' },
                          { text: 'Attribute Detail', link: '/api/rest-api/admin/catalog/attributes/attributes-detail' },
                          { text: 'Create Attribute', link: '/api/rest-api/admin/catalog/attributes/attributes-create' },
                          { text: 'Update Attribute', link: '/api/rest-api/admin/catalog/attributes/attributes-update' },
                          { text: 'Delete Attribute', link: '/api/rest-api/admin/catalog/attributes/attributes-delete' },
                          { text: 'Mass Delete Attributes', link: '/api/rest-api/admin/catalog/attributes/attributes-mass-delete' },
                          { text: 'Attribute Options (CRUD)', link: '/api/rest-api/admin/catalog/attributes/attribute-options' },
                        ]
                      },
                      {
                        text: 'Attribute Families',
                        link: '/api/rest-api/admin/catalog/families/',
                        collapsed: true,
                        items: [
                          { text: 'Families Listing (Datagrid)', link: '/api/rest-api/admin/catalog/families/families-listing' },
                          { text: 'Family Detail', link: '/api/rest-api/admin/catalog/families/families-detail' },
                          { text: 'Create Family', link: '/api/rest-api/admin/catalog/families/families-create' },
                          { text: 'Update Family', link: '/api/rest-api/admin/catalog/families/families-update' },
                          { text: 'Delete Family', link: '/api/rest-api/admin/catalog/families/families-delete' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Appearance',
                    link: '/api/rest-api/admin/appearance/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Themes',
                        link: '/api/rest-api/admin/appearance/themes/',
                        collapsed: true,
                        items: [
                          { text: 'List Themes', link: '/api/rest-api/admin/appearance/themes/list' },
                          { text: 'Get Theme', link: '/api/rest-api/admin/appearance/themes/detail' },
                          { text: 'Theme Impact', link: '/api/rest-api/admin/appearance/themes/impact' },
                          { text: 'Activate Theme', link: '/api/rest-api/admin/appearance/themes/activate' },
                        ]
                      },
                      {
                        text: 'Sections',
                        link: '/api/rest-api/admin/appearance/sections/',
                        collapsed: true,
                        items: [
                          { text: 'List Sections', link: '/api/rest-api/admin/appearance/sections/list' },
                          { text: 'Get Section', link: '/api/rest-api/admin/appearance/sections/detail' },
                          { text: 'Create Section', link: '/api/rest-api/admin/appearance/sections/create' },
                          { text: 'Update Section', link: '/api/rest-api/admin/appearance/sections/update' },
                          { text: 'Delete Section', link: '/api/rest-api/admin/appearance/sections/delete' },
                          { text: 'Stage Edits', link: '/api/rest-api/admin/appearance/sections/draft' },
                          { text: 'Stage Status', link: '/api/rest-api/admin/appearance/sections/status' },
                          { text: 'Stage Order', link: '/api/rest-api/admin/appearance/sections/reorder' },
                          { text: 'Copy Section', link: '/api/rest-api/admin/appearance/sections/duplicate' },
                          { text: 'Publish', link: '/api/rest-api/admin/appearance/sections/publish' },
                          { text: 'Discard', link: '/api/rest-api/admin/appearance/sections/discard' },
                          { text: 'Section Fields', link: '/api/rest-api/admin/appearance/sections/fields' },
                          { text: 'Upload Media', link: '/api/rest-api/admin/appearance/sections/media' },
                          { text: 'Preview', link: '/api/rest-api/admin/appearance/sections/preview' },
                        ]
                      },
                    ]
                  },
                  {
                    text: 'CMS',
                    collapsed: true,
                    items: [
                      {
                        text: 'Pages',
                        link: '/api/rest-api/admin/cms/pages/',
                        collapsed: true,
                        items: [
                          { text: 'List Pages', link: '/api/rest-api/admin/cms/pages-list' },
                          { text: 'Page Detail', link: '/api/rest-api/admin/cms/pages-detail' },
                          { text: 'Create Page', link: '/api/rest-api/admin/cms/pages-create' },
                          { text: 'Update Page', link: '/api/rest-api/admin/cms/pages-update' },
                          { text: 'Delete Page', link: '/api/rest-api/admin/cms/pages-delete' },
                          { text: 'Mass Delete Pages', link: '/api/rest-api/admin/cms/pages-mass-delete' },
                          { text: 'Export Pages (CSV)', link: '/api/rest-api/admin/cms/pages/export' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Sales',
                    link: '/api/rest-api/admin/sales/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Orders',
                        link: '/api/rest-api/admin/sales/orders/',
                        collapsed: true,
                        items: [
                          { text: 'List Orders', link: '/api/rest-api/admin/sales/orders/list-orders' },
                          { text: 'Order Detail', link: '/api/rest-api/admin/sales/orders/order-detail' },
                          { text: 'Reorder', link: '/api/rest-api/admin/sales/orders/reorder' },
                          { text: 'Cancel Order', link: '/api/rest-api/admin/sales/orders/cancel' },
                          { text: 'Add Comment', link: '/api/rest-api/admin/sales/orders/add-comment' },
                          { text: 'List Comments', link: '/api/rest-api/admin/sales/orders/list-comments' },
                          { text: 'Create Invoice', link: '/api/rest-api/admin/sales/orders/create-invoice' },
                          { text: 'Get Invoice', link: '/api/rest-api/admin/sales/orders/get-invoice' },
                          { text: 'Print Invoice (PDF)', link: '/api/rest-api/admin/sales/orders/print-invoice' },
                          { text: 'Send Duplicate Invoice', link: '/api/rest-api/admin/sales/orders/send-duplicate-invoice' },
                          { text: 'Create Shipment', link: '/api/rest-api/admin/sales/orders/create-shipment' },
                          { text: 'Get Shipment', link: '/api/rest-api/admin/sales/orders/get-shipment' },
                          { text: 'Create Refund', link: '/api/rest-api/admin/sales/orders/create-refund' },
                          { text: 'Refund Preview', link: '/api/rest-api/admin/sales/orders/refund-preview' },
                          { text: 'Get Refund', link: '/api/rest-api/admin/sales/orders/get-refund' },
                          { text: 'Export Orders (CSV)', link: '/api/rest-api/admin/sales/orders/export' },
                        ]
                      },
                      {
                        text: 'Carts',
                        collapsed: true,
                        items: [
                          { text: 'Get Cart', link: '/api/rest-api/admin/sales/carts/get-cart' },
                          { text: 'Add Item', link: '/api/rest-api/admin/sales/carts/add-item' },
                          { text: 'Update Items', link: '/api/rest-api/admin/sales/carts/update-items' },
                          { text: 'Remove Item', link: '/api/rest-api/admin/sales/carts/remove-item' },
                          { text: 'Save Address', link: '/api/rest-api/admin/sales/carts/save-address' },
                          { text: 'Apply Coupon', link: '/api/rest-api/admin/sales/carts/apply-coupon' },
                          { text: 'Remove Coupon', link: '/api/rest-api/admin/sales/carts/remove-coupon' },
                          { text: 'List Shipping Methods', link: '/api/rest-api/admin/sales/carts/list-shipping-methods' },
                          { text: 'Set Shipping Method', link: '/api/rest-api/admin/sales/carts/set-shipping-method' },
                          { text: 'List Payment Methods', link: '/api/rest-api/admin/sales/carts/list-payment-methods' },
                          { text: 'Set Payment Method', link: '/api/rest-api/admin/sales/carts/set-payment-method' },
                          { text: 'Place Order', link: '/api/rest-api/admin/sales/carts/place-order' },
                        ]
                      },
                      {
                        text: 'Invoices (Datagrid)',
                        link: '/api/rest-api/admin/sales/invoices/',
                        collapsed: true,
                        items: [
                          { text: 'List Invoices', link: '/api/rest-api/admin/sales/invoices/list' },
                          { text: 'Get Invoice', link: '/api/rest-api/admin/sales/orders/get-invoice' },
                          { text: 'Print Invoice (PDF)', link: '/api/rest-api/admin/sales/orders/print-invoice' },
                          { text: 'Send Duplicate Invoice', link: '/api/rest-api/admin/sales/orders/send-duplicate-invoice' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/sales/invoices/mass-update-status' },
                          { text: 'Export Invoices (CSV)', link: '/api/rest-api/admin/sales/invoices/export' },
                        ]
                      },
                      {
                        text: 'Shipments (Datagrid)',
                        link: '/api/rest-api/admin/sales/shipments/',
                        collapsed: true,
                        items: [
                          { text: 'List Shipments', link: '/api/rest-api/admin/sales/shipments/list' },
                          { text: 'Get Shipment', link: '/api/rest-api/admin/sales/orders/get-shipment' },
                          { text: 'Export Shipments (CSV)', link: '/api/rest-api/admin/sales/shipments/export' },
                        ]
                      },
                      {
                        text: 'Refunds (Datagrid)',
                        link: '/api/rest-api/admin/sales/refunds/',
                        collapsed: true,
                        items: [
                          { text: 'List Refunds', link: '/api/rest-api/admin/sales/refunds/list' },
                          { text: 'Get Refund', link: '/api/rest-api/admin/sales/orders/get-refund' },
                          { text: 'Export Refunds (CSV)', link: '/api/rest-api/admin/sales/refunds/export' },
                        ]
                      },
                      {
                        text: 'Returns (RMA)',
                        link: '/api/rest-api/admin/sales/returns/',
                        collapsed: true,
                        items: [
                          { text: 'List Returns', link: '/api/rest-api/admin/sales/returns/list-returns' },
                          { text: 'Get Return', link: '/api/rest-api/admin/sales/returns/get-return' },
                          { text: 'Create Return', link: '/api/rest-api/admin/sales/returns/create-return' },
                          { text: 'Update Status', link: '/api/rest-api/admin/sales/returns/update-status' },
                          { text: 'Reopen Return', link: '/api/rest-api/admin/sales/returns/reopen-return' },
                          { text: 'Returnable Items', link: '/api/rest-api/admin/sales/returns/list-returnable-items' },
                          { text: 'Return Reasons', link: '/api/rest-api/admin/sales/returns/list-return-reasons' },
                          { text: 'Return Messages', link: '/api/rest-api/admin/sales/returns/list-return-messages' },
                          { text: 'Send Return Message', link: '/api/rest-api/admin/sales/returns/send-return-message' },
                        ]
                      },
                      {
                        text: 'EU Withdrawal',
                        link: '/api/rest-api/admin/sales/eu-withdrawal/',
                        collapsed: true,
                        items: [
                          { text: 'List EU Withdrawals', link: '/api/rest-api/admin/sales/eu-withdrawal/list-eu-withdrawals' },
                          { text: 'Get EU Withdrawal', link: '/api/rest-api/admin/sales/eu-withdrawal/get-eu-withdrawal' },
                          { text: 'Decline', link: '/api/rest-api/admin/sales/eu-withdrawal/decline' },
                          { text: 'Mark Refunded', link: '/api/rest-api/admin/sales/eu-withdrawal/mark-refunded' },
                          { text: 'Resend Confirmation', link: '/api/rest-api/admin/sales/eu-withdrawal/resend-confirmation' },
                        ]
                      },
                      {
                        text: 'Transactions',
                        collapsed: true,
                        items: [
                          { text: 'List Transactions', link: '/api/rest-api/admin/sales/transactions/list' },
                          { text: 'Create Transaction', link: '/api/rest-api/admin/sales/transactions/create' },
                          { text: 'Export Transactions (CSV)', link: '/api/rest-api/admin/sales/transactions/export' },
                        ]
                      },
                      {
                        text: 'Bookings',
                        link: '/api/rest-api/admin/sales/bookings/',
                        collapsed: true,
                        items: [
                          { text: 'List Bookings', link: '/api/rest-api/admin/sales/bookings/list' },
                          { text: 'Booking Detail', link: '/api/rest-api/admin/sales/bookings/detail' },
                          { text: 'Export Bookings (CSV)', link: '/api/rest-api/admin/sales/bookings/export' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Customers',
                    link: '/api/rest-api/admin/customers/',
                    collapsed: true,
                    items: [
                      { text: 'List Customers', link: '/api/rest-api/admin/customers/main/list' },
                      { text: 'Customer Detail', link: '/api/rest-api/admin/customers/main/detail' },
                      { text: 'Create Customer', link: '/api/rest-api/admin/customers/main/create' },
                      { text: 'Update Customer', link: '/api/rest-api/admin/customers/main/update' },
                      { text: 'Delete Customer', link: '/api/rest-api/admin/customers/main/delete' },
                      { text: 'Mass Delete', link: '/api/rest-api/admin/customers/main/mass-delete' },
                      { text: 'Mass Update Status', link: '/api/rest-api/admin/customers/main/mass-update-status' },
                      {
                        text: 'Addresses',
                        link: '/api/rest-api/admin/customers/addresses/',
                        collapsed: true,
                        items: [
                          { text: 'List Addresses', link: '/api/rest-api/admin/customers/addresses' },
                          { text: 'Address Detail', link: '/api/rest-api/admin/customers/addresses/detail' },
                          { text: 'Create Address', link: '/api/rest-api/admin/customers/addresses/create' },
                          { text: 'Update Address', link: '/api/rest-api/admin/customers/addresses/update' },
                          { text: 'Delete Address', link: '/api/rest-api/admin/customers/addresses/delete' },
                          { text: 'Set as Default', link: '/api/rest-api/admin/customers/addresses/set-default' },
                        ]
                      },
                      {
                        text: 'Notes',
                        link: '/api/rest-api/admin/customers/notes/',
                        collapsed: true,
                        items: [
                          { text: 'Add Note', link: '/api/rest-api/admin/customers/notes/create' },
                          { text: 'List Notes', link: '/api/rest-api/admin/customers/notes/list' },
                        ]
                      },
                      {
                        text: 'Impersonate',
                        link: '/api/rest-api/admin/customers/impersonate/',
                        collapsed: true,
                        items: [
                          { text: 'Issue Impersonation Token', link: '/api/rest-api/admin/customers/impersonate/create' },
                        ]
                      },
                      {
                        text: 'Customer Groups',
                        link: '/api/rest-api/admin/customers/groups/',
                        collapsed: true,
                        items: [
                          { text: 'List Groups', link: '/api/rest-api/admin/customers/groups/list' },
                          { text: 'Group Detail', link: '/api/rest-api/admin/customers/groups/detail' },
                          { text: 'Create Group', link: '/api/rest-api/admin/customers/groups/create' },
                          { text: 'Update Group', link: '/api/rest-api/admin/customers/groups/update' },
                          { text: 'Delete Group', link: '/api/rest-api/admin/customers/groups/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/customers/groups/mass-delete' },
                        ]
                      },
                      {
                        text: 'Reviews',
                        link: '/api/rest-api/admin/customers/reviews/',
                        collapsed: true,
                        items: [
                          { text: 'List Reviews', link: '/api/rest-api/admin/customers/reviews/list' },
                          { text: 'Review Detail', link: '/api/rest-api/admin/customers/reviews/detail' },
                          { text: 'Review with Images', link: '/api/rest-api/admin/customers/reviews/review-with-images' },
                          { text: 'Update Status', link: '/api/rest-api/admin/customers/reviews/update' },
                          { text: 'Delete Review', link: '/api/rest-api/admin/customers/reviews/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/customers/reviews/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/customers/reviews/mass-update-status' },
                        ]
                      },
                      {
                        text: 'GDPR Requests',
                        link: '/api/rest-api/admin/customers/gdpr/',
                        collapsed: true,
                        items: [
                          { text: 'List Requests', link: '/api/rest-api/admin/customers/gdpr/list' },
                          { text: 'Request Detail', link: '/api/rest-api/admin/customers/gdpr/detail' },
                          { text: 'Update Request', link: '/api/rest-api/admin/customers/gdpr/update' },
                          { text: 'Delete Request', link: '/api/rest-api/admin/customers/gdpr/delete' },
                          { text: 'Process (Approve + Execute)', link: '/api/rest-api/admin/customers/gdpr/process' },
                          { text: 'Download Data Export', link: '/api/rest-api/admin/customers/gdpr/download-data' },
                        ]
                      },
                      {
                        text: 'Create-Order Helpers',
                        link: '/api/rest-api/admin/customers/create-order-helpers/',
                        collapsed: true,
                        items: [
                          { text: 'Active Cart Items', link: '/api/rest-api/admin/customers/active-cart-items' },
                          { text: 'Wishlist Items', link: '/api/rest-api/admin/customers/wishlist-items' },
                          { text: 'Compare Items', link: '/api/rest-api/admin/customers/compare-items' },
                          { text: 'Recent Order Items', link: '/api/rest-api/admin/customers/recent-order-items' },
                          { text: 'Create Draft Cart', link: '/api/rest-api/admin/customers/create-draft-cart' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Settings',
                    collapsed: true,
                    items: [
                      {
                        text: 'Locales',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/locales/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/locales/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/locales/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/locales/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/locales/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/locales/mass-delete' },
                        ]
                      },
                      {
                        text: 'Currencies',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/currencies/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/currencies/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/currencies/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/currencies/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/currencies/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/currencies/mass-delete' },
                        ]
                      },
                      {
                        text: 'Exchange Rates',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/exchange-rates/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/exchange-rates/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/exchange-rates/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/exchange-rates/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/exchange-rates/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/exchange-rates/mass-delete' },
                          { text: 'Update Rates', link: '/api/rest-api/admin/settings/exchange-rates/update-rates' },
                        ]
                      },
                      {
                        text: 'Inventory Sources',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/inventory-sources/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/inventory-sources/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/inventory-sources/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/inventory-sources/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/inventory-sources/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/inventory-sources/mass-delete' },
                        ]
                      },
                      {
                        text: 'Channels',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/channels/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/channels/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/channels/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/channels/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/channels/delete' },
                        ]
                      },
                      {
                        text: 'Admin Users',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/users/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/users/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/users/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/users/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/users/delete' },
                          { text: 'Delete My Account', link: '/api/rest-api/admin/settings/users/delete-self' },
                        ]
                      },
                      {
                        text: 'Roles',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/roles/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/roles/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/roles/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/roles/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/roles/delete' },
                        ]
                      },
                      {
                        text: 'Tax Categories',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/tax-categories/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/tax-categories/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/tax-categories/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/tax-categories/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/tax-categories/delete' },
                        ]
                      },
                      {
                        text: 'Tax Rates',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/tax-rates/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/tax-rates/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/tax-rates/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/tax-rates/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/tax-rates/delete' },
                          { text: 'Export (CSV)', link: '/api/rest-api/admin/settings/tax-rates/export' },
                        ]
                      },
                      {
                        text: 'Return Reasons',
                        link: '/api/rest-api/admin/settings/return-reasons/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/return-reasons/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/return-reasons/get' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/return-reasons/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/return-reasons/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/return-reasons/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/return-reasons/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/settings/return-reasons/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Rules',
                        link: '/api/rest-api/admin/settings/return-rules/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/return-rules/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/return-rules/get' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/return-rules/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/return-rules/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/return-rules/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/return-rules/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/settings/return-rules/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Statuses',
                        link: '/api/rest-api/admin/settings/return-statuses/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/return-statuses/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/return-statuses/get' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/return-statuses/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/return-statuses/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/return-statuses/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/return-statuses/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/settings/return-statuses/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Return Custom Fields',
                        link: '/api/rest-api/admin/settings/return-custom-fields/',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/return-custom-fields/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/return-custom-fields/get' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/return-custom-fields/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/return-custom-fields/update' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/return-custom-fields/delete' },
                          { text: 'Mass Delete', link: '/api/rest-api/admin/settings/return-custom-fields/mass-delete' },
                          { text: 'Mass Update Status', link: '/api/rest-api/admin/settings/return-custom-fields/mass-update-status' },
                        ]
                      },
                      {
                        text: 'Data Transfer Imports',
                        collapsed: true,
                        items: [
                          { text: 'List', link: '/api/rest-api/admin/settings/data-transfer-imports/list' },
                          { text: 'Detail', link: '/api/rest-api/admin/settings/data-transfer-imports/detail' },
                          { text: 'Create', link: '/api/rest-api/admin/settings/data-transfer-imports/create' },
                          { text: 'Update', link: '/api/rest-api/admin/settings/data-transfer-imports/update' },
                          { text: 'Validate', link: '/api/rest-api/admin/settings/data-transfer-imports/validate' },
                          { text: 'Start', link: '/api/rest-api/admin/settings/data-transfer-imports/start' },
                          { text: 'Link', link: '/api/rest-api/admin/settings/data-transfer-imports/link' },
                          { text: 'Index', link: '/api/rest-api/admin/settings/data-transfer-imports/index' },
                          { text: 'Stats', link: '/api/rest-api/admin/settings/data-transfer-imports/stats' },
                          { text: 'Download File', link: '/api/rest-api/admin/settings/data-transfer-imports/download' },
                          { text: 'Download Error Report', link: '/api/rest-api/admin/settings/data-transfer-imports/download-error-report' },
                          { text: 'Download Sample', link: '/api/rest-api/admin/settings/data-transfer-imports/download-sample' },
                          { text: 'Delete', link: '/api/rest-api/admin/settings/data-transfer-imports/delete' },
                          { text: 'Cancel', link: '/api/rest-api/admin/settings/data-transfer-imports/cancel' },
                        ]
                      }
                    ]
                  },
                  {
                    text: 'Dashboard',
                    link: '/api/rest-api/admin/dashboard/',
                    collapsed: true,
                    items: [
                      { text: 'Statistics', link: '/api/rest-api/admin/dashboard/stats' },
                    ]
                  },
                  {
                    text: 'Reporting',
                    link: '/api/rest-api/admin/reporting/',
                    collapsed: true,
                    items: [
                      { text: 'Overview', link: '/api/rest-api/admin/reporting/overview' },
                      { text: 'Sales', link: '/api/rest-api/admin/reporting/sales' },
                      { text: 'Customers', link: '/api/rest-api/admin/reporting/customers' },
                      { text: 'Products', link: '/api/rest-api/admin/reporting/products' },
                    ]
                  },
                  {
                    text: 'Marketing',
                    link: '/api/rest-api/admin/marketing/',
                    collapsed: true,
                    items: [
                      {
                        text: 'Promotions',
                        link: '/api/rest-api/admin/marketing/promotions/',
                        collapsed: true,
                        items: [
                          {
                            text: 'Catalog Rules',
                            link: '/api/rest-api/admin/marketing/promotions/catalog-rules/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/promotions/catalog-rules-mass-delete' },
                            ]
                          },
                          {
                            text: 'Cart Rules',
                            link: '/api/rest-api/admin/marketing/promotions/cart-rules/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/promotions/cart-rules-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/promotions/cart-rules-detail' },
                              { text: 'Copy', link: '/api/rest-api/admin/marketing/promotions/cart-rules-copy' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/promotions/cart-rules-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/promotions/cart-rules-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/promotions/cart-rules-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/promotions/cart-rules-mass-delete' },
                            ]
                          },
                          {
                            text: 'Cart Rule Coupons',
                            link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons-list' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons-create' },
                              { text: 'Bulk Generate', link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons-generate' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/promotions/cart-rule-coupons-mass-delete' },
                            ]
                          },
                        ]
                      },
                      {
                        text: 'Communications',
                        link: '/api/rest-api/admin/marketing/communications/',
                        collapsed: true,
                        items: [
                          {
                            text: 'Email Templates',
                            link: '/api/rest-api/admin/marketing/communications/templates/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/communications/templates-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/communications/templates-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/communications/templates-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/communications/templates-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/communications/templates-delete' },
                            ]
                          },
                          {
                            text: 'Events',
                            link: '/api/rest-api/admin/marketing/communications/events/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/communications/events-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/communications/events-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/communications/events-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/communications/events-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/communications/events-delete' },
                            ]
                          },
                          {
                            text: 'Campaigns',
                            link: '/api/rest-api/admin/marketing/communications/campaigns/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/communications/campaigns-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/communications/campaigns-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/communications/campaigns-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/communications/campaigns-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/communications/campaigns-delete' },
                              { text: 'Send', link: '/api/rest-api/admin/marketing/communications/campaigns-send' },
                            ]
                          },
                          {
                            text: 'Newsletter Subscribers',
                            link: '/api/rest-api/admin/marketing/communications/subscribers/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/communications/subscribers-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/communications/subscribers-detail' },
                              { text: 'Toggle Subscription', link: '/api/rest-api/admin/marketing/communications/subscribers-toggle' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/communications/subscribers-delete' },
                            ]
                          },
                        ]
                      },
                      {
                        text: 'Search SEO',
                        link: '/api/rest-api/admin/marketing/search-seo/',
                        collapsed: true,
                        items: [
                          {
                            text: 'URL Rewrites',
                            link: '/api/rest-api/admin/marketing/search-seo/url-rewrites/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/search-seo/url-rewrites-mass-delete' },
                            ]
                          },
                          {
                            text: 'Search Terms',
                            link: '/api/rest-api/admin/marketing/search-seo/search-terms/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/search-seo/search-terms-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/search-seo/search-terms-detail' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/search-seo/search-terms-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/search-seo/search-terms-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/search-seo/search-terms-mass-delete' },
                            ]
                          },
                          {
                            text: 'Search Synonyms',
                            link: '/api/rest-api/admin/marketing/search-seo/search-synonyms/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-delete' },
                              { text: 'Mass Delete', link: '/api/rest-api/admin/marketing/search-seo/search-synonyms-mass-delete' },
                            ]
                          },
                          {
                            text: 'Sitemaps',
                            link: '/api/rest-api/admin/marketing/search-seo/sitemaps/',
                            collapsed: true,
                            items: [
                              { text: 'List', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-list' },
                              { text: 'Detail', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-detail' },
                              { text: 'Create', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-create' },
                              { text: 'Update', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-update' },
                              { text: 'Delete', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-delete' },
                              { text: 'Regenerate', link: '/api/rest-api/admin/marketing/search-seo/sitemaps-generate' },
                            ]
                          },
                        ]
                      },
                    ]
                  },
                  {
                    text: 'Configuration',
                    collapsed: true,
                    link: '/api/rest-api/admin/configuration/',
                    items: [
                      { text: 'Menu', link: '/api/rest-api/admin/configuration/menu' },
                      { text: 'Slugs', link: '/api/rest-api/admin/configuration/slugs' },
                      { text: 'Values', link: '/api/rest-api/admin/configuration/values' },
                      { text: 'Update', link: '/api/rest-api/admin/configuration/update' },
                    ]
                  }
                ]
              },
              { text: 'Playground Guide', link: '/api/rest-api/playground' },
              { text: 'Best Practices', link: '/api/rest-api/best-practices' },
            ]
          },
    ],

    outline: {
      level: 'deep'
    },

    footer: {
      message: 'Released under the <a href="https://opensource.org/licenses/mit" target="_blank" class="mit-license">MIT License</a>.',
      copyright: `Copyright © ${new Date().getFullYear()} Webkul`
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bagisto/bagisto-api' }
    ],

    search: {
      provider: 'local'
    }
  },

  buildEnd(siteConfig: any) {
    const outDir = siteConfig.outDir

    Object.entries(redirects).forEach(([from, to]) => {
      if (from.includes('*')) {
        console.warn(`⚠️ Skipping wildcard redirect: ${from} -> ${to}`)
        return
      }

      let filePath

      if (from.endsWith('.html')) {
        filePath = path.join(outDir, from)
      } else {
        filePath = path.join(outDir, from, 'index.html')
      }

      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, makeRedirectHtml(to), 'utf-8')
      console.log(`✅ Redirect created: ${from} -> ${to}`)
    })
  }
  })
})
