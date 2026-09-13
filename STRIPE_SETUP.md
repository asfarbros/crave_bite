# Stripe Payment Integration

CraveBite supports Stripe card payments alongside Cash on Delivery at checkout.

## Configuration

- Backend: set `STRIPE_SECRET_KEY` in `backend/.env` (see `backend/.env.example`).
- Frontend: set `VITE_STRIPE_PUBLISHABLE_KEY` in `frontend/.env` (see `frontend/.env.example`).

Never commit real secret keys. The Stripe *publishable* key is safe to expose client-side; the *secret* key must only ever live in `backend/.env`.

## How it works

1. The user adds items to their cart and proceeds to `/checkout`.
2. Selecting "Credit/Debit Card" calls `POST /api/payment/create-payment-intent` (auth required). The backend computes the charge amount from the user's own cart server-side — it never trusts a client-supplied amount.
3. Stripe Elements (`@stripe/react-stripe-js`) collects card details and confirms the payment intent.
4. On success, the frontend calls `POST /api/order/place` to convert the cart into an order, then redirects to `/success`.
5. Selecting "Cash on Delivery" skips Stripe and calls `POST /api/order/place` directly.

Relevant files: `backend/routes/payment.js`, `frontend/src/pages/Checkout.jsx`, `frontend/src/pages/Success.jsx`.

## Testing

Use Stripe's test card numbers in test mode:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- CVC: any 3 digits, Expiry: any future date

## Security notes

- The Stripe secret key must never appear in frontend code or be committed to the repo.
- Always use HTTPS in production.
- `create-payment-intent` and `confirm-payment` both require a valid auth token (`backend/routes/payment.js`).
