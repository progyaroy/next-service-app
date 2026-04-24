# Stripe Payment API Documentation

Complete API reference for the Stripe payment integration.

## Authentication

All endpoints (except webhooks) require JWT authentication via `parlour_session` cookie.

## Endpoints

### POST /api/checkout

Create a payment intent and order for checkout.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "clientSecret": "pi_1234567890_secret_1234567890",
    "paymentIntentId": "pi_1234567890",
    "totalAmount": 99.99
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Session expired or invalid"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

400 Bad Request:
```json
{
  "success": false,
  "error": {
    "code": "INCOMPLETE_SHIPPING_ADDRESS",
    "message": "All shipping address fields are required"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": {
    "code": "STRIPE_PAYMENT_INTENT_ERROR",
    "message": "Failed to create payment intent"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Notes:**
- Cart must not be empty
- All shipping address fields are required
- User must be authenticated
- Order is created with status "pending"
- Payment intent is created with automatic payment methods enabled

---

### GET /api/orders

Retrieve user's orders.

**Authentication:** Required (JWT)

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "items": [
          {
            "productId": "507f1f77bcf86cd799439013",
            "name": "Product Name",
            "price": 29.99,
            "quantity": 2
          }
        ],
        "totalAmount": 59.98,
        "status": "completed",
        "stripePaymentIntentId": "pi_1234567890",
        "shippingAddress": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1 (555) 123-4567",
          "street": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "postalCode": "10001",
          "country": "US"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "count": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Session expired or invalid"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### POST /api/webhooks/stripe

Stripe webhook endpoint for payment events.

**Authentication:** Not required (Stripe signature verification)

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Request Body:**
Stripe Event object (raw JSON)

**Response (200 OK):**
```json
{
  "received": true
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": "Missing signature"
}
```

401 Unauthorized:
```json
{
  "error": "Invalid signature"
}
```

500 Internal Server Error:
```json
{
  "error": "Webhook processing failed"
}
```

**Handled Events:**

#### payment_intent.succeeded
- Updates order status to "completed"
- Clears user's cart
- Triggered when payment is successfully processed

#### payment_intent.payment_failed
- Updates order status to "failed"
- Triggered when payment fails

#### payment_intent.canceled
- Updates order status to "cancelled"
- Triggered when payment is cancelled

**Notes:**
- Webhook signature is verified using `STRIPE_WEBHOOK_SECRET`
- Always returns 200 OK to prevent Stripe retries
- Events are idempotent (safe to process multiple times)
- Metadata contains `orderId` and `userId` for processing

---

## Data Models

### Order

```typescript
interface Order {
  _id: ObjectId
  userId: ObjectId
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "completed" | "failed" | "cancelled"
  stripePaymentIntentId: string
  stripeCustomerId?: string
  shippingAddress?: ShippingAddress
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  productId: ObjectId
  name: string
  price: number
  quantity: number
}

interface ShippingAddress {
  name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}
```

### Payment Intent

```typescript
interface PaymentIntent {
  id: string                    // pi_1234567890
  clientSecret: string          // pi_1234567890_secret_1234567890
  amount: number                // In cents (e.g., 9999 for $99.99)
  currency: string              // "usd"
  status: string                // "succeeded", "processing", "requires_payment_method"
  customer: string              // Stripe customer ID
  metadata: {
    userId: string
    orderId: string
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH_ERROR | 401 | Authentication failed or session expired |
| VALIDATION_ERROR | 400 | Invalid input data |
| MISSING_SHIPPING_ADDRESS | 400 | Shipping address not provided |
| INCOMPLETE_SHIPPING_ADDRESS | 400 | Shipping address missing required fields |
| EMPTY_CART | 400 | Cart is empty |
| INSUFFICIENT_STOCK | 400 | Product stock insufficient |
| NOT_FOUND | 404 | Resource not found |
| STRIPE_CUSTOMER_ERROR | 500 | Failed to create Stripe customer |
| STRIPE_PAYMENT_INTENT_ERROR | 500 | Failed to create payment intent |
| STRIPE_WEBHOOK_ERROR | 401 | Webhook signature verification failed |
| STRIPE_METADATA_ERROR | 400 | Invalid payment intent metadata |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Rate Limiting

Recommended rate limits:

- Checkout endpoint: 10 requests per minute per user
- Orders endpoint: 30 requests per minute per user
- Webhook endpoint: No limit (Stripe controlled)

---

## Security

### Headers

All responses include:
- `Content-Type: application/json`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

### HTTPS

- Required for production
- All sensitive data transmitted over HTTPS

### Authentication

- JWT tokens in httpOnly cookies
- Token verified on every request
- Session expires after 7 days (30 days with "remember me")

### Webhook Verification

- Stripe signature verified using webhook secret
- Prevents unauthorized webhook calls
- Signature includes timestamp for replay attack prevention

---

## Examples

### Complete Checkout Flow

```javascript
// 1. User submits shipping address
const checkoutResponse = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shippingAddress: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    }
  })
});

const { data } = await checkoutResponse.json();
// data.clientSecret, data.orderId, data.totalAmount

// 2. Client confirms payment with Stripe
const { paymentIntent } = await stripe.confirmPayment({
  elements,
  redirect: 'if_required'
});

// 3. Stripe sends webhook to /api/webhooks/stripe
// 4. Order status updated to "completed"
// 5. User redirected to /order-confirmation/{orderId}
```

### Retrieve Orders

```javascript
const response = await fetch('/api/orders');
const { data } = await response.json();
// data.orders, data.count
```

---

## Testing

### Test Credentials

**Card Numbers:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Mastercard: 5555 5555 5555 4444

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)

### Test Webhook

```bash
# Using Stripe CLI
stripe trigger payment_intent.succeeded

# Or manually
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: t=1234567890,v1=signature" \
  -d '{"type":"payment_intent.succeeded",...}'
```

---

## Monitoring

### Logs

All API calls are logged with:
- Timestamp
- User ID
- Endpoint
- Request/response data
- Errors

### Metrics

Track:
- Payment success rate
- Average order value
- Failed payment reasons
- Webhook delivery status
- API response times

### Alerts

Set up alerts for:
- Failed payments
- Webhook failures
- Database errors
- Stripe API errors
- High error rates

---

## Versioning

Current API version: 1.0.0

Future versions may include:
- Refunds API
- Subscriptions API
- Invoicing API
- Dispute handling

---

## Support

For issues:
1. Check error code and message
2. Review logs for details
3. Verify Stripe Dashboard
4. Contact support with error details
