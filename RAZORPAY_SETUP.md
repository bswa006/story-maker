# Razorpay Setup Instructions

## 1. Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up for a new account
3. Complete KYC verification for live payments

## 2. Get API Keys
1. Login to Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to Settings > API Keys
3. Generate API Keys for:
   - Test Mode (for development)
   - Live Mode (for production)

## 3. Add Environment Variables

### For Local Development (.env.local):
```
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

### For Vercel Production:
```bash
# Add to Vercel environment variables
vercel env add RAZORPAY_KEY_ID production
# Enter: rzp_live_your_live_key_id

vercel env add RAZORPAY_KEY_SECRET production  
# Enter: your_live_key_secret

# For preview environment
vercel env add RAZORPAY_KEY_ID preview
# Enter: rzp_test_your_test_key_id

vercel env add RAZORPAY_KEY_SECRET preview
# Enter: your_test_key_secret
```

## 4. Test the Integration

### Test Mode:
- Use test API keys
- No real money involved
- Use test card numbers from Razorpay docs

### Live Mode:
- Use live API keys
- Real payments will be processed
- Ensure proper testing before going live

## 5. Webhooks (Optional but Recommended)
1. In Razorpay Dashboard, go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events: payment.captured, payment.failed, order.paid
4. Save webhook secret for verification

## 6. Current Integration Features
- ✅ Order creation with Razorpay SDK
- ✅ Payment verification with signature validation
- ✅ Error handling and user feedback
- ✅ Mobile-responsive payment flow
- ✅ Automatic order status updates

## 7. Test Card Details (Test Mode Only)
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

For more test cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/