# Stripe Payment Integration Setup

## Overview
This restaurant app now includes Stripe payment processing for credit/debit card payments. When users select "Credit/Debit Card" as their payment method, they will be redirected to Stripe's secure payment page.

## Features
- ✅ Secure credit/debit card processing via Stripe
- ✅ Cash on delivery option
- ✅ Real-time payment validation
- ✅ Order summary with tax calculation
- ✅ Success page after payment completion
- ✅ Error handling and user feedback

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_349847508994559872345897
STRIPE_SECRET_KEY=sk_238509182509870587205
```

### 2. Dependencies
The following packages have been installed:
- Backend: `stripe`
- Frontend: `@stripe/stripe-js`

### 3. Running the Application

1. Start the backend server:
   ```bash
   npm start
   ```

2. Open the checkout page in your browser:
   ```
   http://localhost:5000/client/checkout.html
   ```

## How It Works

### Payment Flow
1. User adds items to cart and proceeds to checkout
2. On checkout page, user selects payment method:
   - **Credit/Debit Card**: Redirects to Stripe payment page
   - **Cash on Delivery**: Processes order locally
3. For card payments:
   - Backend creates a payment intent
   - Frontend loads Stripe Elements
   - User enters card details on Stripe's secure page
   - Payment is processed and user is redirected to success page

### API Endpoints
- `POST /api/payment/create-payment-intent` - Creates a new payment intent
- `POST /api/payment/confirm-payment` - Confirms payment completion

### Files Modified/Created
- `routes/payment.js` - Payment API endpoints
- `client/checkout.html` - Updated with Stripe integration
- `client/success.html` - New success page
- `client/cart.html` - Updated to pass total to checkout
- `server.js` - Added payment routes

## Testing

### Test Card Numbers
Use these test card numbers for testing:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test CVC and Expiry
- CVC: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)

## Security Notes
- Never expose your Stripe secret key in client-side code
- Always use HTTPS in production
- Implement proper error handling and validation
- Consider adding webhook endpoints for payment status updates

## Customization
- Modify tax rate in `checkout.html` (currently 8.5%)
- Update success page styling and content
- Add order confirmation emails
- Implement inventory management
- Add payment webhooks for real-time updates

## Troubleshooting
- Ensure server is running on port 5000
- Check browser console for JavaScript errors
- Verify Stripe keys are correct
- Make sure CORS is properly configured
- Check network tab for API call failures 