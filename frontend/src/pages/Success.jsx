import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Success() {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    orderId: 'ORD-12345',
    paymentMethod: 'Credit Card',
    totalAmount: '₹28.20',
    deliveryTime: '30-45 minutes'
  });

  useEffect(() => {
    // Get payment details from URL parameters
    const paymentIntentId = searchParams.get('payment_intent');
    const totalAmount = searchParams.get('total') || localStorage.getItem('lastOrderTotal') || '28.20';
    
    if (paymentIntentId) {
      setOrderDetails(prev => ({
        ...prev,
        orderId: `#${paymentIntentId.slice(-8).toUpperCase()}`
      }));
    }

    // Update total amount
    setOrderDetails(prev => ({
      ...prev,
      totalAmount: `₹${parseFloat(totalAmount).toFixed(2)}`
    }));

    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 10000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-md text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your order has been placed and payment has been processed successfully.</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold mb-4">Order Details</h3>
        <div className="text-left space-y-2">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-mono">{orderDetails.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{orderDetails.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold">{orderDetails.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span>{orderDetails.deliveryTime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You will receive an email confirmation shortly with your order details and tracking information.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105">
            Continue Shopping
          </a>
          <a href="/menu" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105">
            View Menu
          </a>
        </div>
      </div>
    </div>
  );
}

export default Success; 