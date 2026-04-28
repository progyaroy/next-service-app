# Service System Documentation

## Overview

The Service system is a production-grade feature that allows parlour admins to create and manage services (e.g., Haircut, Facial) with optional included products. Services are fully integrated with the cart and order systems, providing a seamless experience for both admins and users.

## Architecture

### Database Models

#### Service Model (`lib/models/Service.ts`)
```typescript
interface IService {
  name: string;
  description: string;
  basePrice: number;
  includedProducts: IServiceProduct[];
  createdAt: Date;
  updatedAt: Date;
}

interface IServiceProduct {
  productId: ObjectId;
  quantity: number;
}
```

**Key Features:**
- `basePrice`: Service labor/charge (e.g., ₹200 for haircut)
- `includedProducts`: Optional products bundled with service
- Computed `totalPrice` = basePrice + sum(product.price × quantity)

#### Updated Cart Model (`lib/models/Cart.ts`)
```typescript
interface ICartItem {
  itemId: ObjectId;
  itemType: "product" | "service";
  quantity: number;
  snapshotPrice: number;
  snapshotData?: Record<string, any>;
  addedAt: Date;
}
```

**Key Features:**
- Unified cart for both products and services
- `snapshotPrice`: Price captured at time of adding (prevents price inconsistency)
- `snapshotData`: Full item data snapshot for order history

#### Updated Order Model (`lib/models/Order.ts`)
```typescript
interface IOrderItem {
  itemId: ObjectId;
  itemType: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  snapshotData?: Record<string, any>;
}
```

## Service Layer

### ServiceService (`lib/services/service.service.ts`)

**Methods:**

```typescript
// Get all services with computed total prices
getAllServices(): Promise<ServiceWithTotalPrice[]>

// Get service by ID
getServiceById(id: string): Promise<ServiceWithTotalPrice | null>

// Create service with included products
createService(
  name: string,
  description: string,
  basePrice: number,
  includedProducts?: IServiceProduct[]
): Promise<ServiceWithTotalPrice>

// Update service
updateService(
  id: string,
  updates: Partial<ServiceDTO>
): Promise<ServiceWithTotalPrice | null>

// Delete service
deleteService(id: string): Promise<boolean>
```

**Price Calculation:**
```typescript
totalPrice = basePrice + sum(product.price × quantity for each included product)
```

### Updated CartService (`lib/services/cart.service.ts`)

**Key Changes:**
- Supports both products and services
- Stores snapshot price to prevent price inconsistency
- Validates product stock and service existence

```typescript
addToCart(
  userId: string,
  itemId: string,
  itemType: "product" | "service",
  quantity: number,
  snapshotPrice?: number
): Promise<CartDTO>
```

### Updated OrderService (`lib/services/order.service.ts`)

**Key Changes:**
- Creates orders from mixed cart (products + services)
- Stores item type and snapshot data
- Validates both product stock and service existence

## Admin Interface

### Pages

#### Services List (`app/admin/services/page.tsx`)
- Display all services with base price and total price
- Show number of included products
- Edit/Delete actions
- ISR revalidation: 60 seconds

#### Create Service (`app/admin/services/new/page.tsx`)
- Form with service name, description, base price
- Multi-select product picker
- Real-time price calculation preview
- Shows selected products with prices

#### Edit Service (`app/admin/services/[id]/page.tsx`)
- Pre-populated form with existing data
- Update service details and included products
- Same multi-select interface as create

### Components

#### ServicesList (`components/modules/admin/services/list.tsx`)
- Card-based layout showing all services
- Displays base price, total price, included product count
- Edit/Delete buttons with confirmation

#### NewService (`components/modules/admin/services/new.tsx`)
- Two-column layout: form + product selector
- Real-time total price calculation
- Shows selected products with prices

#### EditServiceForm (`components/modules/admin/services/edit.tsx`)
- Same layout as NewService
- Pre-populated with existing service data
- Maintains selected products state

## User Interface

### Pages

#### Services Listing (`app/(public)/services/page.tsx`)
- Grid layout showing all services
- ISR revalidation: 60 seconds
- Shows service name, description, base price, total price
- Click to view details

#### Service Details (`app/(public)/services/[id]/page.tsx`)
- Full service information
- Price breakdown showing:
  - Service charge
  - Each included product with price
  - Total price
- Add to cart button
- ISR revalidation: 60 seconds

### Components

#### Services (`components/modules/common/services.tsx`)
- Grid display of services
- Shows name, description, base price, total price
- Links to detail page

#### ServiceDetails (`components/modules/common/service-details.tsx`)
- Full service information
- Included products list with prices
- Price breakdown card
- Add to cart button

## Cart Integration

### Updated AddToCartButton (`components/ui/add-to-cart-button.tsx`)

**New Props:**
```typescript
interface AddToCartButtonProps {
  itemId: string;
  itemType?: "product" | "service";
  itemName?: string;
  itemPrice?: number;
  quantity?: number;
  // Legacy support
  productId?: string;
}
```

**Usage:**
```typescript
// For products (legacy)
<AddToCartButton productId={id} />

// For products (new)
<AddToCartButton itemId={id} itemType="product" />

// For services
<AddToCartButton itemId={id} itemType="service" itemPrice={totalPrice} />
```

### Updated Cart Display (`components/modules/cart/index.tsx`)

**Features:**
- Shows item type badge (Product/Service)
- Uses snapshot price for calculations
- Supports quantity updates for both types
- Unified remove/update interface

## Server Actions

### Admin Actions (`lib/actions/admin.ts`)

```typescript
// Create service
createService(prevState: any, formData: FormData): Promise<ActionState>

// Update service
updateService(id: string, prevState: any, formData: FormData): Promise<ActionState>

// Delete service
deleteService(id: string): Promise<void>
```

**Form Data:**
- `name`: Service name (required)
- `description`: Service description (required)
- `basePrice`: Base price (required, > 0)
- `includedProducts[]`: Array of product IDs (optional)

### Cart Actions (`lib/actions/cart.ts`)

**Updated to support services:**
```typescript
addToCartAction(
  _prev: CartActionState,
  formData: FormData
): Promise<CartActionState>
```

**Form Data:**
- `itemId`: Product or Service ID (required)
- `itemType`: "product" or "service" (default: "product")
- `quantity`: Quantity (default: 1)

## Data Flow

### Adding Service to Cart

```
User clicks "Add to Cart"
    ↓
AddToCartButton sends formData with itemId, itemType="service"
    ↓
addToCartAction validates user authentication
    ↓
cartService.addToCart() called with:
  - userId
  - serviceId
  - itemType="service"
  - snapshotPrice (calculated from basePrice + products)
    ↓
Service fetched from DB
Total price calculated (basePrice + products)
    ↓
Cart item created with:
  - itemId: serviceId
  - itemType: "service"
  - snapshotPrice: totalPrice
  - snapshotData: full service object
    ↓
Cart updated in DB
User sees success message
```

### Creating Order

```
User clicks "Place Order"
    ↓
placeOrderAction called
    ↓
orderService.createOrderFromCart() processes each cart item:
  - For products: validates stock, uses snapshotPrice
  - For services: validates existence, uses snapshotPrice
    ↓
Order created with items containing:
  - itemId, itemType, name, price (snapshot), quantity
  - snapshotData: full item data
    ↓
Cart cleared
Order returned with ID
    ↓
User redirected to /orders
```

## Price Consistency

### Problem Solved
Without snapshot prices, if a service price changes after adding to cart, the order total would be incorrect.

### Solution
- `snapshotPrice` captured when item added to cart
- Used for all calculations (cart total, order total)
- Original item data stored in `snapshotData` for reference

### Example
```
Service "Haircut" created: basePrice=200, products=[Shampoo(50)]
Total: 250

User adds to cart → snapshotPrice=250 stored

Admin updates Shampoo price to 100

User's cart still shows 250 (from snapshot)
Order total: 250 (from snapshot)
```

## Validation

### Service Creation
- ✓ Name required and non-empty
- ✓ Description required and non-empty
- ✓ Base price required and > 0
- ✓ Included products must exist in DB
- ✓ Product quantities must be ≥ 1

### Cart Operations
- ✓ Service must exist when adding to cart
- ✓ Product stock validated for product items
- ✓ Quantity must be ≥ 1
- ✓ User must be authenticated

### Order Creation
- ✓ Cart must not be empty
- ✓ All services must exist
- ✓ All products must exist
- ✓ Product stock must be sufficient

## Performance

### ISR Strategy
- Services list page: 60-second revalidation
- Service detail page: 60-second revalidation
- Admin pages: Dynamic rendering (real-time updates)

### Database Queries
- Service list: Single query with product population
- Service detail: Single query with product population
- Cart operations: Indexed by userId for fast lookups
- Order creation: Batch validation of items

## API Routes

### Cart API (`app/api/cart/route.ts`)
- Supports both products and services
- Uses updated CartService

### Orders API (`app/api/orders/route.ts`)
- Supports mixed orders (products + services)
- Uses updated OrderService

## Testing Checklist

- [ ] Create service with no products
- [ ] Create service with multiple products
- [ ] Edit service (change name, price, products)
- [ ] Delete service
- [ ] Add service to cart
- [ ] Add product to cart (verify compatibility)
- [ ] Update service quantity in cart
- [ ] Remove service from cart
- [ ] Place order with services only
- [ ] Place order with products only
- [ ] Place order with mixed items
- [ ] Verify price snapshot in order
- [ ] Verify ISR revalidation on service list
- [ ] Verify ISR revalidation on service detail

## File Structure

```
lib/
  models/
    Service.ts (NEW)
  services/
    service.service.ts (NEW)
    cart.service.ts (UPDATED)
    order.service.ts (UPDATED)
  actions/
    admin.ts (UPDATED - added service actions)
    cart.ts (UPDATED - support itemType)

components/
  modules/
    admin/
      services/ (NEW)
        list.tsx
        new.tsx
        edit.tsx
    common/
      services.tsx (NEW)
      service-details.tsx (NEW)
  ui/
    add-to-cart-button.tsx (UPDATED)

app/
  admin/
    services/ (NEW)
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx
  (public)/
    services/ (NEW)
      page.tsx
      [id]/
        page.tsx

components/
  modules/
    cart/
      index.tsx (UPDATED)
    header/
      header-nav.tsx (UPDATED)
```

## Future Enhancements

1. **Service Categories**: Group services by type (Hair, Skin, etc.)
2. **Service Variants**: Different durations/intensities of same service
3. **Booking System**: Schedule services for specific times
4. **Service Ratings**: User reviews and ratings
5. **Combo Deals**: Discounted bundles of services
6. **Service Availability**: Mark services as available/unavailable
7. **Staff Assignment**: Assign services to specific staff members
8. **Service Duration**: Track service duration for scheduling
