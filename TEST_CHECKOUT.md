# Testing the Stripe Checkout Flow

## Prerequisites

1. ✅ Stripe packages installed
2. ✅ Build passing
3. ✅ `.env.local` configured with Stripe keys
4. ✅ Stripe CLI webhook running (for local testing)

## Step-by-Step Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to App
- Open http://localhost:3000
- Log in with your account

### 3. Add Products to Cart
- Go to Products page
- Click "Add to Cart" on any product
- Verify cart count increases

### 4. Proceed to Checkout
- Click cart icon or go to `/cart`
- Click "Proceed to Checkout" button
- Should navigate to `/payment`

### 5. Fill Shipping Address
- **Full Name**: John Doe
- **Email**: john@example.com
- **Phone**: +1 (555) 123-4567
- **Street**: 123 Main Street
- **City**: New York
- **State**: NY
- **Postal Code**: 10001
- **Country**: United States
- Click "Continue to Payment"

### 6. Enter Payment Details
- Use test card: **4242 4242 4242 4242**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Click "Pay $XX.XX"

### 7. Verify Success
- ✅ Should redirect to order confirmation page
- ✅ Order ID should display
- ✅ Order details should show
- ✅ Shipping address should display
- ✅ Order items should list

## Expected Results

### Successful Checkout
```
✅ Order created in database
✅ Payment intent created in Stripe
✅ Webhook received (check Stripe CLI)
✅ Order status updated to "completed"
✅ Cart cleared
✅ Confirmation page displays
```

### Order Confirmation Page
- Order ID
- Order date
- Order status: "completed"
- Order items with prices
- Shipping address
- Total amount
- Links to account and products

## Test Cards

| Card Type | Number | Status | Use Case |
|-----------|--------|--------|----------|
| Visa | 4242 4242 4242 4242 | Success | Normal payment |
| Visa | 4000 0000 0000 0002 | Decline | Test decline |
| Mastercard | 5555 5555 5555 4444 | Success | Alternative card |
| Amex | 3782 822463 10005 | Success | American Express |

**Expiry**: Any future date (e.g., 12/25)
**CVC**: Any 3 digits (e.g., 123)

## Troubleshooting

### "Shipping address is required"
- Ensure all fields are filled
- Check for empty fields
- Verify form validation

### "Failed to create checkout session"
- Check browser console for errors
- Verify Stripe keys in `.env.local`
- Check server logs for API errors

### "Payment failed"
- Use correct test card: 4242 4242 4242 4242
- Verify expiry date is in future
- Check CVC is 3 digits
- Check Stripe Dashboard for payment intent details

### "Order not created"
- Check MongoDB connection
- Verify database is running
- Check server logs for errors
- Verify cart has items

### "Webhook not received"
- Verify Stripe CLI is running
- Check webhook URL: `localhost:3000/api/webhooks/stripe`
- Verify webhook secret in `.env.local`
- Check Stripe CLI output for events

## Verification Checklist

- [ ] Development server running
- [ ] Logged in to account
- [ ] Products added to cart
- [ ] Shipping form displays
- [ ] All fields can be filled
- [ ] Payment form displays
- [ ] Test card accepted
- [ ] Order confirmation page displays
- [ ] Order in database
- [ ] Webhook received
- [ ] Cart cleared

## Database Verification

### Check Order Created
```javascript
// In MongoDB
db.orders.findOne({ userId: "your_user_id" })
```

Should show:
```json
{
  "_id": "...",
  "userId": "...",
  "items": [...],
  "totalAmount": 99.99,
  "status": "completed",
  "stripePaymentIntentId": "pi_...",
  "shippingAddress": {...},
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Check Cart Cleared
```javascript
// In MongoDB
db.carts.findOne({ userId: "your_user_id" })
```

Should return `null` (cart deleted after successful payment)

## Stripe Dashboard Verification

1. Go to https://dashboard.stripe.com
2. Click **Payments**
3. Look for your test payment
4. Verify:
   - Amount is correct
   - Status is "Succeeded"
   - Metadata includes orderId and userId

## Common Issues

### Issue: "stripePaymentIntentId is required"
**Status**: ✅ FIXED
- This was the bug that was fixed
- Should no longer occur

### Issue: Cart not clearing
**Solution**:
- Verify webhook is received
- Check order status is "completed"
- Manually clear cart if needed

### Issue: Order not showing in confirmation
**Solution**:
- Verify order was created in database
- Check order ID in URL
- Verify user authorization

## Next Steps After Testing

1. ✅ Verify checkout works end-to-end
2. ✅ Test with different test cards
3. ✅ Test error scenarios
4. ✅ Set up email notifications
5. ✅ Deploy to staging
6. ✅ Deploy to production

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Test Cards**: https://stripe.com/docs/testing
- **Troubleshooting**: See TROUBLESHOOTING.md

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2026-04-22
