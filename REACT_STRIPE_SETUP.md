# React App with Stripe Integration - Setup Guide

## ✅ **Setup Complete!**

Your React app now has Stripe payment integration. Here's how to use it:

## **How to Run Both Servers:**

### 1. **Backend Server (Port 5000)**
```bash
# In the restaurant-app directory
npm start
```
This runs your Express server with Stripe payment endpoints.

### 2. **React App (Port 5174)**
```bash
# In the restaurant-app/client directory
npm run dev
```
This runs your React development server.

## **How to Test:**

1. **Start both servers** (see above)
2. **Open your React app**: `http://localhost:5174`
3. **Navigate to checkout**: Click "Proceed to Checkout" or go to `/checkout`
4. **Test payment**:
   - Select "Credit/Debit Card"
   - Use test card: `4242 4242 4242 4242`
   - CVC: `123`
   - Expiry: Any future date (e.g., `12/25`)

## **What's Been Added:**

### **New React Components:**
- `src/pages/Checkout.jsx` - Stripe payment form
- `src/pages/Success.jsx` - Payment success page

### **New Routes:**
- `/checkout` - Payment page
- `/success` - Success page

### **Installed Packages:**
- `@stripe/stripe-js` - Stripe JavaScript SDK
- `@stripe/react-stripe-js` - React components for Stripe

## **Features:**

✅ **Secure Stripe Integration** - Uses your API key  
✅ **Credit/Debit Card Processing** - Real payment processing  
✅ **Cash on Delivery Option** - Alternative payment method  
✅ **Order Summary** - Shows subtotal, tax, and total  
✅ **Success Page** - Confirmation after payment  
✅ **Error Handling** - User-friendly error messages  
✅ **Loading States** - Smooth user experience  

## **Your Stripe API Key:**
```
pk_test_51RqgzcRXkMEPeVyWnPUATveye8itlX81ZhK1Bn6yJS6nnQgSv18eyc6m4gEAad82rLqOpXJ1BCg0fDOILDF7nea500x0FM9gqF
```

## **Test Cards:**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **CVC**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)

## **Troubleshooting:**

1. **"Payment system not initialized"** - Make sure backend server is running on port 5000
2. **CORS errors** - Backend CORS is configured for localhost:5174
3. **Network errors** - Check if both servers are running

## **Next Steps:**

1. **Test the payment flow** with the test card
2. **Customize the order data** in `Checkout.jsx`
3. **Add real cart integration** to pass actual cart items
4. **Style the components** to match your design
5. **Add order confirmation emails**

Your Stripe integration is now ready to use! 🎉 