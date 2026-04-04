import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RqgzcRXkMEPeVyWnPUATveye8itlX81ZhK1Bn6yJS6nnQgSv18eyc6m4gEAad82rLqOpXJ1BCg0fDOILDF7nea500x0FM9gqF');

// Sample order data (in a real app, this would come from cart state)
const orderData = {
  subtotal: 25.99,
  tax: 2.21,
  total: 28.20
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

         if (paymentMethod === 'card') {
       // Store the total amount for the success page
       localStorage.setItem('lastOrderTotal', orderData.total.toString());
       const { error } = await stripe.confirmPayment({
         elements,
         confirmParams: {
           return_url: `${window.location.origin}/success?total=${orderData.total}`,
         },
       });

       if (error) {
         setMessage(error.message);
       }
     } else {
       // Cash on delivery
       localStorage.setItem('lastOrderTotal', orderData.total.toString());
       setTimeout(() => {
         setMessage('Order placed successfully! Redirecting...');
         setTimeout(() => {
           window.location.href = `/success?total=${orderData.total}`;
         }, 2000);
       }, 1000);
     }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Checkout</h2>
      
      {/* Customer Information */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Customer Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full border border-gray-300 p-2 rounded" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full border border-gray-300 p-2 rounded" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <textarea 
              required 
              className="w-full border border-gray-300 p-2 rounded"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>₹{orderData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax (8.5%):</span>
          <span>₹{orderData.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>₹{orderData.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="card" 
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="cod" 
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            <span>Cash on Delivery</span>
          </label>
        </div>
      </div>

      {/* Stripe Payment Element */}
      {paymentMethod === 'card' && (
        <div className="mb-6">
          <PaymentElement />
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isLoading || !stripe} 
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full w-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Place Order'}
      </button>

      {/* Message */}
      {message && (
        <div className="mt-4 p-3 rounded text-center">
          {message.includes('success') ? (
            <div className="text-green-600 font-semibold">{message}</div>
          ) : (
            <div className="text-red-600 font-semibold">{message}</div>
          )}
        </div>
      )}
    </form>
  );
}

function Checkout() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: orderData.total,
            currency: 'usd'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('Failed to create payment intent:', data.message);
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    createPaymentIntent();
  }, []);

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p>Loading payment system...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}

export default Checkout; 