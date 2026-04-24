# Stripe Payment Integration Setup Guide

This guide walks through setting up Stripe payment processing for the Parlour App checkout system.

## Prerequisites

- Stripe account (create at https://stripe.com)
- Node.js 18+ and npm/yarn
- MongoDB connection (already configured)

## Step 1: Install Stripe Dependencies

```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

## Step 2: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your keys:
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 3: Configure Environment Variables

Update `.env.local` with your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Note:** The `NEXT_PUBLIC_` prefix makes the publishable key available to the browser (this is safe and required).

## Step 4: Set Up Webhook

Webhooks allow Stripe to notify your app about payment events.

### Local Development (Testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Authenticate with your Stripe account:
   ```bash
   stripe login
   ```
3. Forward webhook events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```

### Production Deployment

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the signing secret and add to production environment variables

## Step 5: Database Schema Updates

The following models have been created/updated:

### New Models
- **Order** (`lib/models/Order.ts`) - Stores order information with Stripe payment intent tracking
- **Stripe Service** (`lib/services/stripe.service.ts`) - Handles Stripe API interactions
- **Order Service** (`lib/services/order.service.ts`) - Manages order operations

### Updated Models
- **User** - Ready for Stripe customer ID storage (optional enhancement)

## Step 6: API Endpoints

The following endpoints are now available:

### POST `/api/checkout`
Creates a payment intent and order for checkout.

**Request:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "clientSecret": "pi_1234567890_secret_1234567890",
    "paymentIntentId": "pi_1234567890",
    "totalAmount": 99.99
  }
}
```

### GET `/api/orders`
Retrieves user's orders (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "count": 5
  }
}
```

### POST `/api/webhooks/stripe`
Webhook endpoint for Stripe events (automatically called by Stripe).

## Step 7: Frontend Integration

### Payment Flow

1. **Cart Page** → User clicks "Proceed to Checkout"
2. **Shipping Form** (`/payment`) → User enters shipping address
3. **Payment Form** → User enters payment details via Stripe Elements
4. **Order Confirmation** → Success page with order details

### Key Components

- `components/modules/payment/shipping-form.tsx` - Shipping address form
- `components/modules/payment/checkout-form.tsx` - Stripe payment form
- `app/(user)/payment/page.tsx` - Checkout page
- `app/(user)/order-confirmation/[id]/page.tsx` - Order confirmation page

## Step 8: Testing

### Test Card Numbers

Use these card numbers in test mode:

| Card Type | Number | Expiry | CVC |
|-----------|--------|--------|-----|
| Visa | 4242 4242 4242 4242 | 12/25 | 123 |
| Visa (Decline) | 4000 0000 0000 0002 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

### Test Flow

1. Add products to cart
2. Click "Proceed to Checkout"
3. Fill in shipping address
4. Enter test card details
5. Complete payment
6. Verify order confirmation page
7. Check Stripe Dashboard for payment intent

## Step 9: Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Enable HTTPS (required for Stripe)
- [ ] Test with real payment methods
- [ ] Set up email notifications for orders
- [ ] Configure order fulfillment process
- [ ] Set up customer support for payment issues
- [ ] Enable 3D Secure for additional security
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Set up alerts for webhook failures

## Security Best Practices

1. **Never expose secret key** - Only use in server-side code
2. **Validate amounts** - Always verify order total on backend
3. **Use HTTPS** - Required for production
4. **Secure webhooks** - Verify webhook signatures (already implemented)
5. **PCI Compliance** - Use Stripe Elements to avoid handling raw card data
6. **Rate limiting** - Implement rate limiting on checkout endpoint
7. **Idempotency** - Use idempotency keys for payment operations

## Troubleshooting

### "STRIPE_SECRET_KEY is not configured"
- Ensure `.env.local` has `STRIPE_SECRET_KEY` set
- Restart development server after updating env vars

### Webhook not triggering
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
- Review webhook logs in Stripe Dashboard

### Payment fails with "Invalid client secret"
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
- Verify payment intent was created successfully
- Check browser console for Stripe.js errors

### Order not created after payment
- Check webhook logs in Stripe Dashboard
- Verify database connection
- Review server logs for errors

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Payment Intent API](https://stripe.com/docs/payments/payment-intents)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Testing Guide](https://stripe.com/docs/testing)

## Support

For issues or questions:
1. Check Stripe Dashboard logs
2. Review server console output
3. Consult Stripe documentation
4. Contact Stripe support at support@stripe.com
