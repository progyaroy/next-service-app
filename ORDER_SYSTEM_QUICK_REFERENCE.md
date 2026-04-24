# Order System - Quick Reference

## User Features

### Place Order
```
1. Add products to cart
2. Go to /cart
3. Click "Place Order" button
4. See success notification
5. Auto-redirect to /orders
```

### View Orders
- Navigate to `/orders` from sidebar
- See list of all your orders
- Click "View Details" to see full order information

### Order Details
- Order ID
- Order date
- Order status (Completed/Cancelled)
- Items with prices
- Total amount
- Last updated date

## Admin Features

### View All Orders
- Navigate to `/admin/orders` from sidebar
- See statistics:
  - Total orders
  - Total revenue
  - Completed orders
  - Cancelled orders
- View orders table with:
  - Order ID
  - Customer email
  - Number of items
  - Total amount
  - Status
  - Order date

## Database

### Order Model
```typescript
{
  _id: ObjectId
  userId: ObjectId
  items: [
    { productId, name, price, quantity }
  ]
  totalAmount: number
  status: "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
```

## Server Actions

### Place Order
```typescript
import { placeOrderAction } from "@/lib/actions/order";

const result = await placeOrderAction();
if (result.success) {
  // Order placed successfully
  // result.orderId contains the order ID
}
```

### Get User Orders
```typescript
import { getUserOrdersAction } from "@/lib/actions/order";

const { orders, error } = await getUserOrdersAction();
```

### Get All Orders (Admin)
```typescript
import { getAllOrdersAction } from "@/lib/actions/order";

const { orders, error } = await getAllOrdersAction();
```

### Cancel Order
```typescript
import { cancelOrderAction } from "@/lib/actions/order";

const result = await cancelOrderAction(orderId);
```

## Services

### Order Service
```typescript
import orderService from "@/lib/services/order.service";

// Create order from cart
const order = await orderService.createOrderFromCart(userId);

// Get order
const order = await orderService.getOrder(orderId, userId);

// Get user orders
const orders = await orderService.getUserOrders(userId);

// Get all orders (admin)
const orders = await orderService.getAllOrders();

// Update status
const order = await orderService.updateOrderStatus(orderId, status, userId);

// Cancel order
const order = await orderService.cancelOrder(orderId, userId);
```

## Routes

### User Routes
- `/cart` - Shopping cart with "Place Order" button
- `/orders` - List of user's orders
- `/orders/[id]` - Order details page

### Admin Routes
- `/admin/orders` - All orders dashboard with statistics

## Components

### Cart Module
- Location: `components/modules/cart/index.tsx`
- Features:
  - Add/remove items
  - Update quantities
  - Place order button
  - Success/error notifications
  - Auto-redirect on success

## Sidebar Navigation

### User Sidebar
```
Dashboard
├── Account
├── Orders (NEW)
├── Profile
├── Settings
└── Logout
```

### Admin Sidebar
```
Admin Panel
├── Dashboard
├── Products
├── Categories
├── Orders (NEW)
├── Users
└── Logout
```

## Error Handling

### Common Errors
- "Cart is empty" - Add items before placing order
- "Insufficient stock" - Not enough items in stock
- "Not authenticated" - User must be logged in
- "Unauthorized" - Admin access required

## Status Codes

### Order Status
- `completed` - Order successfully placed
- `cancelled` - Order was cancelled
- `pending` - (Not used in current implementation)

## Testing Checklist

- [ ] Add products to cart
- [ ] Click "Place Order"
- [ ] See success notification
- [ ] Auto-redirect to /orders
- [ ] Order appears in list
- [ ] Click "View Details"
- [ ] See full order information
- [ ] Admin can see all orders
- [ ] Admin sees statistics
- [ ] Admin sees customer emails

## Performance

- Database indexes on:
  - `userId` - Fast user order lookup
  - `status` - Fast status filtering
  - `createdAt` - Fast sorting

## Security

- ✅ User can only see their own orders
- ✅ Admin can see all orders
- ✅ Stock validation before order
- ✅ Authentication required
- ✅ Authorization checks

## Notifications

### User Notifications
- Success: "Order placed successfully!"
- Error: Specific error message
- Auto-redirect to /orders after 2 seconds

## Future Enhancements

1. Email notifications
2. Order tracking
3. Refund management
4. Invoice generation
5. Shipping integration
6. Payment integration

---

**Last Updated**: 2026-04-22
**Status**: ✅ Production Ready
