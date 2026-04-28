# Service System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Admin Panel                          User Interface             │
│  ┌──────────────────────┐            ┌──────────────────────┐   │
│  │ /admin/services      │            │ /services            │   │
│  │ - List services      │            │ - Browse services    │   │
│  │ - Create service     │            │ - View details       │   │
│  │ - Edit service       │            │ - Add to cart        │   │
│  │ - Delete service     │            │ - View cart          │   │
│  │ - Multi-select       │            │ - Place order        │   │
│  │   products           │            │ - View orders        │   │
│  └──────────────────────┘            └──────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Admin Components              User Components                   │
│  ┌──────────────────────┐     ┌──────────────────────┐          │
│  │ ServicesList         │     │ Services             │          │
│  │ NewService           │     │ ServiceDetails       │          │
│  │ EditServiceForm      │     │ AddToCartButton      │          │
│  └──────────────────────┘     │ CartModule           │          │
│                               └──────────────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Admin Actions              Cart Actions                         │
│  ┌──────────────────────┐   ┌──────────────────────┐            │
│  │ createService()      │   │ addToCartAction()    │            │
│  │ updateService()      │   │ removeFromCartAction │            │
│  │ deleteService()      │   │ updateQuantityAction │            │
│  └──────────────────────┘   │ clearCartAction()    │            │
│                             └──────────────────────┘            │
│                                                                   │
│  Order Actions                                                   │
│  ┌──────────────────────┐                                        │
│  │ placeOrderAction()   │                                        │
│  │ getUserOrdersAction()│                                        │
│  └──────────────────────┘                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ServiceService              CartService                         │
│  ┌──────────────────────┐   ┌──────────────────────┐            │
│  │ getAllServices()     │   │ getCart()            │            │
│  │ getServiceById()     │   │ addToCart()          │            │
│  │ createService()      │   │ removeFromCart()     │            │
│  │ updateService()      │   │ updateQuantity()     │            │
│  │ deleteService()      │   │ clearCart()          │            │
│  │ calculateTotalPrice()│   │ getCartItemCount()   │            │
│  └──────────────────────┘   └──────────────────────┘            │
│                                                                   │
│  OrderService                                                    │
│  ┌──────────────────────┐                                        │
│  │ createOrderFromCart()│                                        │
│  │ getOrder()           │                                        │
│  │ getUserOrders()      │                                        │
│  │ getAllOrders()       │                                        │
│  │ updateOrderStatus()  │                                        │
│  │ cancelOrder()        │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA MODEL LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Service Model               Cart Model                          │
│  ┌──────────────────────┐   ┌──────────────────────┐            │
│  │ _id                  │   │ userId               │            │
│  │ name                 │   │ items[]              │            │
│  │ description          │   │ ├─ itemId           │            │
│  │ basePrice            │   │ ├─ itemType         │            │
│  │ includedProducts[]   │   │ ├─ quantity         │            │
│  │ ├─ productId         │   │ ├─ snapshotPrice    │            │
│  │ ├─ quantity          │   │ ├─ snapshotData     │            │
│  │ createdAt            │   │ └─ addedAt          │            │
│  │ updatedAt            │   │ createdAt           │            │
│  └──────────────────────┘   │ updatedAt           │            │
│                             └──────────────────────┘            │
│                                                                   │
│  Order Model                                                     │
│  ┌──────────────────────┐                                        │
│  │ userId               │                                        │
│  │ items[]              │                                        │
│  │ ├─ itemId            │                                        │
│  │ ├─ itemType          │                                        │
│  │ ├─ name              │                                        │
│  │ ├─ price             │                                        │
│  │ ├─ quantity          │                                        │
│  │ └─ snapshotData      │                                        │
│  │ totalAmount          │                                        │
│  │ status               │                                        │
│  │ createdAt            │                                        │
│  │ updatedAt            │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MongoDB Collections                                             │
│  ┌──────────────────────┐                                        │
│  │ services             │                                        │
│  │ carts                │                                        │
│  │ orders               │                                        │
│  │ products             │                                        │
│  │ users                │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Adding Service to Cart

```
User clicks "Add to Cart"
        ↓
AddToCartButton component
        ↓
addToCartAction (server action)
        ↓
Authenticate user
        ↓
cartService.addToCart()
        ├─ Fetch service from DB
        ├─ Calculate totalPrice = basePrice + products
        ├─ Create cart item with snapshotPrice
        └─ Save to DB
        ↓
Refresh cart context
        ↓
Show success message
```

### Creating Order

```
User clicks "Place Order"
        ↓
placeOrderAction (server action)
        ↓
Authenticate user
        ↓
orderService.createOrderFromCart()
        ├─ Get user's cart
        ├─ For each cart item:
        │  ├─ If product: validate stock
        │  └─ If service: validate existence
        ├─ Create order with items
        ├─ Use snapshotPrice for totals
        └─ Clear cart
        ↓
Return order ID
        ↓
Redirect to /orders
```

### Service Price Calculation

```
Admin creates service:
  basePrice = 200
  includedProducts = [
    { productId: "prod1", quantity: 1 },  // Shampoo: 50
    { productId: "prod2", quantity: 1 }   // Serum: 100
  ]

ServiceService.calculateTotalPrice():
  totalPrice = 200 + (50 × 1) + (100 × 1)
  totalPrice = 350

User adds to cart:
  snapshotPrice = 350 (captured at this moment)

Admin changes Shampoo price to 100:
  Service totalPrice now = 200 + 100 + 100 = 400
  But user's cart still shows 350 (from snapshot)

Order created:
  Uses snapshotPrice = 350
  Order reflects what user saw
```

## Component Hierarchy

```
App
├── Admin Routes
│   └── /admin/services
│       ├── page.tsx
│       │   └── ServicesList
│       │       ├── ServiceCard (edit/delete)
│       │       └── Link to create
│       ├── /new
│       │   └── page.tsx
│       │       └── NewService
│       │           ├── Form (name, description, price)
│       │           └── ProductSelector
│       └── /[id]
│           └── page.tsx
│               └── EditServiceForm
│                   ├── Form (pre-populated)
│                   └── ProductSelector
│
├── Public Routes
│   └── /services
│       ├── page.tsx
│           └── Services (grid)
│               └── ServiceCard (link to detail)
│       └── /[id]
│           └── page.tsx
│               └── ServiceDetails
│                   ├── ServiceInfo
│                   ├── IncludedProducts
│                   ├── PriceBreakdown
│                   └── AddToCartButton
│
└── Shared Components
    ├── Header
    │   └── HeaderNav (with services link)
    ├── Cart
    │   └── CartModule
    │       ├── CartItem (product or service)
    │       └── OrderSummary
    └── UI
        └── AddToCartButton (supports both types)
```

## State Management

### Cart Context
```typescript
interface CartContextType {
  cart: CartDTO | null;
  itemCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

// Provides:
// - Current cart state
// - Item count
// - Refresh function
// - Loading state
```

### Component State
```typescript
// AddToCartButton
- isPending: boolean (from useTransition)
- state: { error?, success? }

// CartModule
- isPending: boolean
- error: string | null
- success: string | null

// NewService / EditServiceForm
- selectedProducts: string[]
- isPending: boolean
- state: { error? }
```

## API Contracts

### Service Service
```typescript
interface ServiceWithTotalPrice extends ServiceDTO {
  totalPrice: number;
}

getAllServices(): Promise<ServiceWithTotalPrice[]>
getServiceById(id: string): Promise<ServiceWithTotalPrice | null>
createService(name, description, basePrice, includedProducts?): Promise<ServiceWithTotalPrice>
updateService(id, updates): Promise<ServiceWithTotalPrice | null>
deleteService(id): Promise<boolean>
```

### Cart Service
```typescript
type CartItemType = "product" | "service";

addToCart(
  userId: string,
  itemId: string,
  itemType: CartItemType,
  quantity: number,
  snapshotPrice?: number
): Promise<CartDTO>

removeFromCart(
  userId: string,
  itemId: string,
  itemType: CartItemType
): Promise<CartDTO | null>

updateQuantity(
  userId: string,
  itemId: string,
  quantity: number,
  itemType: CartItemType
): Promise<CartDTO | null>
```

### Order Service
```typescript
createOrderFromCart(userId: string): Promise<OrderDTO>
getOrder(orderId: string, userId: string): Promise<OrderDTO | null>
getUserOrders(userId: string, limit?: number): Promise<OrderDTO[]>
getAllOrders(limit?: number): Promise<OrderDTO[]>
updateOrderStatus(orderId: string, status: OrderStatus, userId: string): Promise<OrderDTO>
cancelOrder(orderId: string, userId: string): Promise<OrderDTO>
```

## Error Handling

```
User Action
    ↓
Server Action
    ├─ Validate input
    ├─ Check authentication
    ├─ Call service
    └─ Handle errors:
        ├─ ValidationError → Return error message
        ├─ NotFoundError → Return 404
        ├─ AuthError → Redirect to login
        └─ ServerError → Return generic error
    ↓
Component
    ├─ Display error message
    ├─ Show success message
    └─ Update UI state
```

## Performance Optimization

### ISR Strategy
```
/services (list)
├─ Revalidate: 60 seconds
├─ Cache: Static with revalidation
└─ Benefit: Fast loads, fresh data

/services/[id] (detail)
├─ Revalidate: 60 seconds
├─ Cache: Static with revalidation
└─ Benefit: Fast loads, fresh data

/admin/services (admin list)
├─ Revalidate: Dynamic
├─ Cache: No cache
└─ Benefit: Real-time updates
```

### Database Indexes
```
Service:
- _id (default)
- createdAt (for sorting)

Cart:
- userId (unique, for fast lookups)

Order:
- userId (for user queries)
- status (for filtering)
- createdAt (for sorting)
```

## Security Layers

```
Request
    ↓
Authentication Check
├─ Is user logged in?
└─ Get user ID
    ↓
Authorization Check
├─ Is user admin? (for admin actions)
└─ Is user owner? (for user data)
    ↓
Input Validation
├─ Required fields present?
├─ Data types correct?
└─ Values in valid range?
    ↓
Business Logic
├─ Validate item existence
├─ Check stock/availability
└─ Calculate prices server-side
    ↓
Database Operation
├─ Use Mongoose (SQL injection safe)
└─ Proper error handling
    ↓
Response
└─ Return sanitized data
```

## Deployment Architecture

```
Client (Browser)
    ↓
Next.js App Router
├─ Static pages (ISR)
├─ Dynamic pages
└─ API routes
    ↓
Server Actions
├─ Authentication
├─ Authorization
└─ Business logic
    ↓
Service Layer
├─ ServiceService
├─ CartService
└─ OrderService
    ↓
Database Layer
├─ Mongoose models
└─ MongoDB
    ↓
External Services
└─ Stripe (optional)
```

## Monitoring & Logging

```
Admin Actions
├─ Log: Service created/updated/deleted
├─ Track: User who performed action
└─ Monitor: Performance metrics

Cart Operations
├─ Log: Item added/removed/updated
├─ Track: User ID and item details
└─ Monitor: Cart abandonment

Order Creation
├─ Log: Order created
├─ Track: Items and total
└─ Monitor: Order success rate
```

## Scalability Considerations

1. **Database Indexing**: Indexes on userId, status, createdAt
2. **Caching**: ISR for public pages, Redis for cart (future)
3. **Load Balancing**: Stateless server actions
4. **Database Sharding**: By userId for carts/orders
5. **CDN**: Static assets and ISR pages
6. **Rate Limiting**: Prevent abuse of cart/order endpoints

## Future Architecture Enhancements

1. **Service Categories**: Add category model and filtering
2. **Service Variants**: Support different options per service
3. **Booking System**: Add scheduling and availability
4. **Real-time Updates**: WebSocket for live cart sync
5. **Analytics**: Track popular services and conversions
6. **Recommendations**: ML-based service suggestions
7. **Multi-tenant**: Support multiple parlours
8. **Mobile App**: Native mobile client
