# Cart Functionality Implementation

## Overview
Complete add-to-cart functionality with authentication checks, persistent storage, and real-time cart updates.

## Features
- ✅ Add products to cart (with auth redirect if not logged in)
- ✅ Remove items from cart
- ✅ Update item quantities
- ✅ Clear entire cart
- ✅ Cart icon in header with item count badge
- ✅ Persistent cart storage in MongoDB
- ✅ Real-time cart updates across the app
- ✅ Stock validation

## Architecture

### Database Layer
**File:** `lib/models/Cart.ts`
- MongoDB schema for storing user carts
- Stores userId, items array with productId, quantity, and addedAt timestamp
- Unique index on userId (one cart per user)

### Service Layer
**File:** `lib/services/cart.service.ts`
- `getCart(userId)` - Fetch user's cart with populated product details
- `addToCart(userId, productId, quantity)` - Add/update item in cart
- `removeFromCart(userId, productId)` - Remove item from cart
- `updateQuantity(userId, productId, quantity)` - Update item quantity
- `clearCart(userId)` - Clear entire cart
- `getCartItemCount(userId)` - Get total item count

### Server Actions
**File:** `lib/actions/cart.ts`
- `addToCartAction` - Handles add to cart with auth redirect
- `removeFromCartAction` - Remove item from cart
- `updateCartQuantityAction` - Update quantity
- `clearCartAction` - Clear cart

**Key Feature:** If user is not logged in, `addToCartAction` redirects to `/login?next=/products/{productId}`

### API Routes
**File:** `app/api/cart/route.ts`
- `GET /api/cart` - Fetch user's cart (requires auth)
- `HEAD /api/cart` - Get cart item count (returns 0 if not authenticated)

### Client-Side State Management
**File:** `lib/context/CartContext.tsx`
- React Context for global cart state
- `useCart()` hook provides:
  - `cart` - Full cart object with items
  - `itemCount` - Total number of items
  - `isLoading` - Loading state
  - `error` - Error messages
  - `refreshCart()` - Manually refresh cart from API

### UI Components

#### CartIcon
**File:** `components/ui/cart-icon.tsx`
- Displays shopping cart icon in header
- Shows badge with item count
- Links to `/cart` page
- Only visible when user is logged in

#### AddToCartButton
**File:** `components/ui/add-to-cart-button.tsx`
- Server action form button
- Handles auth redirect automatically
- Shows loading state while adding
- Displays success/error messages
- Props:
  - `productId` (required) - Product to add
  - `quantity` (optional, default: 1)
  - `disabled` (optional)
  - `className` (optional)

#### CartModule
**File:** `components/modules/cart/index.tsx`
- Full cart page component
- Display cart items with images and prices
- Quantity selector for each item
- Remove item functionality
- Clear cart button
- Order summary with total
- Empty cart state with link to products

### Pages

#### Cart Page
**File:** `app/(user)/cart/page.tsx`
- Protected route (requires authentication via middleware)
- Displays CartModule component
- Metadata for SEO

## Usage

### Adding to Cart from Product Page
```tsx
import { AddToCartButton } from "@/components/ui";

export default function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <AddToCartButton 
        productId={product._id}
        quantity={1}
        disabled={product.stock === 0}
      />
    </div>
  );
}
```

### Using Cart Context
```tsx
"use client";

import { useCart } from "@/lib/context/CartContext";

export default function CartBadge() {
  const { itemCount } = useCart();
  
  return <span>{itemCount} items</span>;
}
```

### Accessing Cart Data
```tsx
"use client";

import { useCart } from "@/lib/context/CartContext";

export default function CartSummary() {
  const { cart, isLoading } = useCart();
  
  if (isLoading) return <p>Loading...</p>;
  
  return (
    <div>
      {cart?.items.map(item => (
        <div key={item.productId}>
          <p>{item.product?.name}</p>
          <p>Qty: {item.quantity}</p>
        </div>
      ))}
    </div>
  );
}
```

## Authentication Flow

### Unauthenticated User Adds to Cart
1. User clicks "Add to Cart" button
2. `addToCartAction` checks if user is logged in
3. If not logged in → Redirect to `/login?next=/products/{productId}`
4. After login → User is redirected back to product page
5. User can then add to cart

### Authenticated User Adds to Cart
1. User clicks "Add to Cart" button
2. `addToCartAction` adds item to MongoDB cart
3. `CartContext` automatically refreshes
4. Cart icon badge updates
5. Success message displayed

## Data Flow

```
Product Page
    ↓
AddToCartButton (form)
    ↓
addToCartAction (server action)
    ↓
cartService.addToCart() (MongoDB)
    ↓
API /api/cart (fetch)
    ↓
CartContext (state update)
    ↓
CartIcon badge updates
```

## Protected Routes
- `/cart` - Requires authentication (middleware redirects to `/login`)
- `/api/cart` - Requires authentication (returns 401 if not logged in)

## Stock Validation
- `addToCart()` checks product stock before adding
- `updateQuantity()` validates requested quantity against stock
- Throws error if insufficient stock

## Error Handling
- Invalid product ID → "Product not found"
- Insufficient stock → "Insufficient stock"
- Not authenticated → Redirect to login
- API errors → Error message displayed to user

## Files Created/Modified

### New Files
- `lib/models/Cart.ts` - Cart schema
- `lib/services/cart.service.ts` - Cart business logic
- `lib/actions/cart.ts` - Server actions
- `lib/context/CartContext.tsx` - React context
- `components/ui/cart-icon.tsx` - Cart icon component
- `components/ui/add-to-cart-button.tsx` - Add to cart button
- `components/modules/cart/index.tsx` - Cart page component
- `app/(user)/cart/page.tsx` - Cart page
- `app/(user)/cart/layout.tsx` - Cart layout
- `app/api/cart/route.ts` - Cart API routes
- `CART_IMPLEMENTATION.md` - This file

### Modified Files
- `components/site-header.tsx` - Added CartIcon
- `app/layout.tsx` - Wrapped with CartProvider
- `components/ui/index.ts` - Exported new components
- `components/modules/common/products.tsx` - Added AddToCartButton
- `components/modules/common/details.tsx` - Added AddToCartButton

## Testing

### Test Add to Cart (Not Logged In)
1. Go to `/products`
2. Click "Add to Cart" on any product
3. Should redirect to `/login?next=/products/{id}`
4. After login, should redirect back to product page

### Test Add to Cart (Logged In)
1. Login first
2. Go to `/products`
3. Click "Add to Cart"
4. Cart icon badge should update
5. Success message should appear

### Test Cart Page
1. Add items to cart
2. Go to `/cart`
3. Should see all items with prices and quantities
4. Test quantity selector
5. Test remove button
6. Test clear cart button

### Test Cart Persistence
1. Add items to cart
2. Refresh page
3. Cart should still have items (fetched from API)
4. Logout and login
5. Cart should persist (stored in MongoDB)

## Performance Considerations
- Cart data fetched on app load via `CartContext`
- Cart icon updates automatically after add/remove
- Quantity updates are optimistic (immediate UI update)
- ISR on product pages (revalidate: 60)
- Lean queries in MongoDB for performance

## Security
- Cart operations require authentication
- JWT token validation on API routes
- Server actions validate user session
- Stock validation prevents overselling
- httpOnly cookies for session storage
