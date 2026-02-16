# Shopify Backend API

Backend API para tienda Shopify con Express.js. Integra Storefront API, manejar productos, carrito, búsqueda, formularios y más.

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Mdx2025/shopify-backend.git
cd shopify-backend

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your Shopify credentials

# Run
npm start
```

## ⚙️ Configuración

Crear archivo `.env`:

```env
NODE_ENV=development
PORT=3333

# Shopify Storefront API (REQUIRED)
SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=tu_storefront_access_token
SHOPIFY_API_VERSION=2026-01
```

### Obtener credenciales Shopify

1. Ir a **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Click **Configure Storefront API scopes**
4. Seleccionar permisos:
   - `unauthenticated_read_products`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_write_customers`
5. **Install app** → Copiar **Storefront API access token**

## 📡 Endpoints API

### Health Check

```bash
GET /health
```

Response:
```json
{ "status": "ok" }
```

---

### Products

#### List Products

```bash
GET /api/products?limit=24&sort=CREATED_AT&q=shirt
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 24 | Max results (1-100) |
| `sort` | string | CREATED_AT | CREATED_AT, TITLE, PRICE, BEST_SELLING |
| `q` | string | - | Search query |

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "gid://shopify/Product/123456789",
        "handle": "product-handle",
        "title": "Product Title",
        "price": { "amount": "29.99", "currencyCode": "USD" },
        "image": { "url": "...", "altText": "..." },
        "available": true
      }
    ],
    "pagination": { "page": 1, "limit": 24, "total": 24 }
  }
}
```

#### Get Product by Handle

```bash
GET /api/products/:handle
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "gid://shopify/Product/...",
    "handle": "product-handle",
    "title": "...",
    "description": "...",
    "descriptionHtml": "...",
    "priceRange": {
      "minVariantPrice": { "amount": "29.99", "currencyCode": "USD" },
      "maxVariantPrice": { "amount": "49.99", "currencyCode": "USD" }
    },
    "images": { "edges": [...] },
    "variants": { "edges": [...] },
    "availableForSale": true,
    "tags": [...],
    "vendor": "...",
    "productType": "..."
  }
}
```

---

### Cart

#### Create Cart

```bash
POST /api/cart
Content-Type: application/json

{
  "items": [
    { "variantId": "gid://shopify/ProductVariant/123", "quantity": 1 }
  ]
}
```

#### Add Items to Cart

```bash
POST /api/cart/:cartId/items
Content-Type: application/json

{
  "items": [
    { "variantId": "gid://shopify/ProductVariant/123", "quantity": 2 }
  ]
}
```

#### Update Cart Items

```bash
PATCH /api/cart/:cartId
Content-Type: application/json

{
  "items": [
    { "lineId": "gid://shopify/CartLine/456", "quantity": 3 }
  ]
}
```

#### Remove Cart Item

```bash
DELETE /api/cart/:cartId/items/:lineId
```

---

### Search

```bash
GET /api/search?q=keyword&limit=10
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | - | Search query (min 2 chars) |
| `limit` | number | 10 | Max results (1-50) |

---

### Forms

#### Contact Form

```bash
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I need help with...",
  "consent_to_privacy": true
}
```

**Validation:**
- `name`: required, min 2 chars
- `email`: required, valid email format
- `message`: required
- `consent_to_privacy`: required, must be true

**Success Response:**
```json
{
  "ok": true,
  "data": {
    "id": "contact_1234567890",
    "message": "Received"
  }
}
```

#### Demo Request Form

```bash
POST /api/demo-request
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "consent_to_privacy": true
}
```

---

### Blog

#### List Posts

```bash
GET /api/blog?page=1&limit=12
```

#### Get Post by Slug

```bash
GET /api/blog/:slug
```

---

### Support

#### List Articles

```bash
GET /api/support
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `category` | string | Filter by category (account, billing, technical) |
| `limit` | number | Max results |

#### Get Article by Slug

```bash
GET /api/support/:slug
```

---

## 🧪 Testing

```bash
npm test
```

## 📁 Estructura del Proyecto

```
shopify-backend/
├── src/
│   ├── index.js              # Main server
│   └── modules/
│       ├── shopify/
│       │   └── helpers/
│       │       └── shopify_client.js   # Shopify API client
│       ├── products/       # Products endpoints
│       ├── cart/            # Cart endpoints
│       ├── search/          # Search endpoints
│       ├── forms/           # Contact & Demo forms
│       ├── blog/            # Blog posts
│       └── support/         # Support articles
├── tests/                   # Test files
├── .env.example             # Environment template
├── package.json
└── README.md
```

## 🔒 Errores Comunes

### 401 - Invalid access token

```json
{ "error": { "code": "PRODUCTS_FETCH_ERROR", "message": "Invalid access token" } }
```

**Solución:** Verificar `SHOPIFY_STOREFRONT_ACCESS_TOKEN` en `.env`

### 400 - Missing shop domain

```json
{ "error": { "code": "PRODUCTS_FETCH_ERROR", "message": "SHOP_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required" } }
```

**Solución:** Agregar `SHOP_DOMAIN=tu-tienda.myshopify.com` en `.env`

### 429 - Rate limited

```json
{ "error": { "code": "PRODUCTS_FETCH_ERROR", "message": "Too Many Requests" } }
```

**Solución:** El cliente incluye retry automático. Esperar unos segundos.

## 📝 Licencia

MIT
