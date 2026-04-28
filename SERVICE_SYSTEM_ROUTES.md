# Service System - Routes & URLs

## Admin Routes

### Services Management

| Route | Method | Component | Purpose |
|-------|--------|-----------|---------|
| `/admin/services` | GET | `app/admin/services/page.tsx` | List all services |
| `/admin/services/new` | GET | `app/admin/services/new/page.tsx` | Create service form |
| `/admin/services/:id` | GET | `app/admin/services/[id]/page.tsx` | Edit service form |

### Admin Actions

| Action | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| `createService` | Server Action | POST | Create new service |
| `updateService` | Server Action | POST | Update service |
| `deleteService` | Server Action | POST | Delete service |

## Public Routes

### Services Browsing

| Route | Method | Component | Purpose | ISR |
|-------|--------|-----------|---------|-----|
| `/services` | GET | `app/(public)/services/page.tsx` | List all services | 60s |
| `/services/:id` | GET | `app/(public)/services/[id]/page.tsx` | Service details | 60s |

## User Routes

### Cart & Orders

| Route | Method | Component | Purpose |
|-------|--------|-----------|---------|
| `/cart` | GET | `app/(user)/cart/page.tsx` | View cart |
| `/orders` | GET | `app/(user)/orders/page.tsx` | View orders |
| `/orders/:id` | GET | `app/(user)/orders/[id]/page.tsx` | Order details |

## Server Actions

### Admin Service Actions

```typescript
// lib/actions/admin.ts

createService(prevState: any, formData: FormData)
  - Form fields: name, description, basePrice, includedProducts[]
  - Returns: { error?: string }
  - Redirects to: /admin/services

updateService(id: string, prevState: any, formData: FormData)
  - Form fields: name, description, basePrice, includedProducts[]
  - Returns: { error?: string }
  - Redirects to: /admin/services

deleteService(id: string)
  - Returns: { error?: string }
  - Redirects to: /admin/services
```

### Cart Actions

```typescript
// lib/actions/cart.ts

addToCartAction(_prev: CartActionState, formData: FormData)
  - Form fields: itemId, itemType, quantity
  - Returns: { error?: string, success?: boolean }
  - Redirects to: /login (if not authenticated)

removeFromCartAction(_prev: CartActionState, formData: FormData)
  - Form fields: itemId, itemType
  - Returns: { error?: string, success?: boolean }

updateCartQuantityAction(_prev: CartActionState, formData: FormData)
  - Form fields: itemId, itemType, quantity
  - Returns: { error?: string, success?: boolean }

clearCartAction()
  - Returns: { error?: string, success?: boolean }
```

### Order Actions

```typescript
// lib/actions/order.ts

placeOrderAction()
  - Returns: { error?: string, success?: boolean, orderId?: string }
  - Redirects to: /orders (on success)

getUserOrdersAction()
  - Returns: { orders: OrderDTO[], error?: string }

getAllOrdersAction() // Admin only
  - Returns: { orders: OrderDTO[], error?: string }

cancelOrderAction(orderId: string)
  - Returns: { error?: string, success?: boolean }
```

## API Routes

### Cart API

```
POST /api/cart
  - Body: { itemId, itemType, quantity }
  - Returns: CartDTO

GET /api/cart
  - Returns: CartDTO

DELETE /api/cart/:itemId
  - Query: itemType
  - Returns: CartDTO | null

PATCH /api/cart/:itemId
  - Body: { quantity }
  - Returns: CartDTO
```

### Orders API

```
POST /api/orders
  - Returns: OrderDTO

GET /api/orders
  - Returns: OrderDTO[]

GET /api/orders/:id
  - Returns: OrderDTO

PATCH /api/orders/:id
  - Body: { status }
  - Returns: OrderDTO
```

### Products API

```
GET /api/products
  - Returns: ProductDTO[]

GET /api/products/:id
  - Returns: ProductDTO
```

## Navigation Links

### Admin Navigation

```
/admin
├── Dashboard
├── /admin/products
│   ├── Products list
│   ├── /new → Create product
│   └── /:id → Edit product
├── /admin/services (NEW)
│   ├── Services list
│   ├── /new → Create service
│   └── /:id → Edit service
├── /admin/orders
│   └── Orders list
└── /admin/users
    └── Users list
```

### User Navigation

```
/
├── Home
├── /products
│   ├── Products list
│   └── /:id → Product details
├── /services (NEW)
│   ├── Services list
│   └── /:id → Service details
├── /account
│   ├── Profile
│   ├── /settings
│   └── /orders
│       └── /:id → Order details
└── /cart
    └── Shopping cart
```

## Component Routes

### Admin Components

```
/admin/services
  └── ServicesList
      ├── ServiceCard (edit/delete)
      └── Link to /admin/services/new

/admin/services/new
  └── NewService
      ├── Form
      └── ProductSelector

/admin/services/:id
  └── EditServiceForm
      ├── Form (pre-populated)
      └── ProductSelector
```

### User Components

```
/services
  └── Services
      └── ServiceCard (link to detail)

/services/:id
  └── ServiceDetails
      ├── ServiceInfo
      ├── IncludedProducts
      ├── PriceBreakdown
      └── AddToCartButton

/cart
  └── CartModule
      ├── CartItem (product or service)
      └── OrderSummary
```

## Query Parameters

### Services List
```
/services
  - No query parameters
  - Displays all services
```

### Service Details
```
/services/:id
  - :id = Service MongoDB ObjectId
  - Displays single service
```

### Cart
```
/cart
  - No query parameters
  - Shows user's cart
```

### Orders
```
/orders
  - No query parameters
  - Shows user's orders

/orders/:id
  - :id = Order MongoDB ObjectId
  - Shows order details
```

## Form Data Formats

### Create/Update Service

```javascript
FormData {
  name: "Haircut",
  description: "Professional haircut service",
  basePrice: "200",
  includedProducts: ["productId1", "productId2"]  // Array
}
```

### Add to Cart

```javascript
FormData {
  itemId: "serviceId",
  itemType: "service",  // or "product"
  quantity: "1"
}
```

### Update Cart Quantity

```javascript
FormData {
  itemId: "serviceId",
  itemType: "service",
  quantity: "2"
}
```

### Remove from Cart

```javascript
FormData {
  itemId: "serviceId",
  itemType: "service"
}
```

## Response Formats

### Service Response

```javascript
{
  _id: "ObjectId",
  name: "Haircut",
  description: "Professional haircut",
  basePrice: 200,
  totalPrice: 350,  // Computed
  includedProducts: [
    {
      productId: {
        _id: "ObjectId",
        name: "Shampoo",
        price: 50
      },
      quantity: 1
    }
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Cart Response

```javascript
{
  _id: "ObjectId",
  userId: "ObjectId",
  items: [
    {
      itemId: "ObjectId",
      itemType: "service",
      quantity: 1,
      snapshotPrice: 350,
      snapshotData: { ... },
      addedAt: "2024-01-01T00:00:00Z"
    }
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Order Response

```javascript
{
  _id: "ObjectId",
  userId: "ObjectId",
  items: [
    {
      itemId: "ObjectId",
      itemType: "service",
      name: "Haircut",
      price: 350,
      quantity: 1,
      snapshotData: { ... }
    }
  ],
  totalAmount: 350,
  status: "completed",
  stripePaymentIntentId: "pi_...",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Error Responses

### Validation Error

```javascript
{
  error: "Service name, description, and base price are required"
}
```

### Not Found Error

```javascript
{
  error: "Service not found"
}
```

### Authentication Error

```javascript
// Redirects to /login?next=/services/:id
```

### Authorization Error

```javascript
{
  error: "Not authorized"
}
```

## Redirect Flows

### Create Service
```
/admin/services/new
  ↓ (submit form)
  ↓ (validation)
  ↓ (create in DB)
  ↓ (success)
  → /admin/services
```

### Edit Service
```
/admin/services/:id
  ↓ (submit form)
  ↓ (validation)
  ↓ (update in DB)
  ↓ (success)
  → /admin/services
```

### Delete Service
```
/admin/services
  ↓ (click delete)
  ↓ (confirm)
  ↓ (delete from DB)
  ↓ (success)
  → /admin/services (refreshed)
```

### Add Service to Cart (Not Authenticated)
```
/services/:id
  ↓ (click "Add to Cart")
  ↓ (not authenticated)
  → /login?next=/services/:id
```

### Add Service to Cart (Authenticated)
```
/services/:id
  ↓ (click "Add to Cart")
  ↓ (add to cart)
  ↓ (success)
  → /services/:id (show success message)
```

### Place Order
```
/cart
  ↓ (click "Place Order")
  ↓ (validate cart)
  ↓ (create order)
  ↓ (clear cart)
  ↓ (success)
  → /orders
```

## Middleware Routes

### Authentication Required
- `/cart` - Redirect to `/login` if not authenticated
- `/orders` - Redirect to `/login` if not authenticated
- `/account` - Redirect to `/login` if not authenticated
- `/admin/*` - Redirect to `/login` if not authenticated

### Admin Only
- `/admin/*` - Redirect to `/` if not admin

### Public
- `/` - No authentication required
- `/products` - No authentication required
- `/services` - No authentication required
- `/login` - No authentication required
- `/register` - No authentication required

## ISR Revalidation

### Revalidate on Demand
```typescript
// After creating/updating/deleting service
revalidatePath('/services')
revalidatePath('/services/[id]')
revalidatePath('/admin/services')
```

### Revalidation Schedule
```
/services - Every 60 seconds
/services/[id] - Every 60 seconds
/admin/services - Dynamic (no cache)
```

## Rate Limiting (Future)

```
POST /api/cart - 100 requests/minute per user
POST /api/orders - 10 requests/minute per user
POST /admin/services - 50 requests/minute per admin
```

## Monitoring & Analytics

### Events to Track
- Service created
- Service updated
- Service deleted
- Service viewed
- Service added to cart
- Order placed with service
- Service removed from cart

### Metrics to Monitor
- Services created per day
- Services viewed per day
- Services added to cart per day
- Conversion rate (view → cart → order)
- Average service price
- Most popular services
