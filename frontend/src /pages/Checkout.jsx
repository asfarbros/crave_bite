import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe outside component
const stripePromise = loadStripe("pk_test_51RqgzcRXkMEPeVyWnPUATveye8itlX81ZhK1Bn6yJS6nnQgSv18eyc6m4gEAad82rLqOpXJ1BCg0fDOILDF7nea500x0FM9gqF");

function CheckoutForm({ orderData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required"
    });

    if (error) {
      onError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      <button 
        disabled={!stripe || loading}
        className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full w-full shadow-md transition-all duration-300 disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ₹${orderData.total.toFixed(2)}`}
      </button>
    </form>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderTotal = location.state?.total || 25.99;
  
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const total = parseFloat(orderTotal);
    const subtotal = total / 1.085;
    const tax = total - subtotal;
    setOrderSummary({ subtotal, tax, total });
  }, [orderTotal]);

  const loadStripePayment = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: orderSummary.total, currency: "usd" })
      });
      const data = await res.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setStatusMsg({ type: "error", text: data.message });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Failed to initialize payment system." });
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "card") {
      loadStripePayment();
    }
  }, [paymentMethod, orderSummary.total]);

  const placeBackendOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatusMsg({ type: "error", text: "You must be logged in." });
      return false;
    }

    try {
      const response = await fetch("http://localhost:5000/api/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) return true;
      setStatusMsg({ type: "error", text: data.message || "Order placement failed." });
      return false;
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Network error placing order." });
      return false;
    }
  };

  const handleCODSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    const success = await placeBackendOrder();
    if (success) {
      setStatusMsg({ type: "success", text: "Order placed successfully!" });
      setTimeout(() => navigate("/success"), 1500);
    }
    setPaymentLoading(false);
  };

  const handleStripeSuccess = async () => {
    const success = await placeBackendOrder();
    if (success) {
      setStatusMsg({ type: "success", text: "Payment and Order placed successfully!" });
      setTimeout(() => navigate("/success"), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-md w-full my-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Checkout</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span><span>₹{orderSummary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax (8.5%):</span><span>₹{orderSummary.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Total:</span><span>₹{orderSummary.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Payment Method</label>
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <label className="flex items-center cursor-pointer">
            <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="form-radio h-5 w-5 text-yellow-500 mr-3" />
            <span className="font-medium text-gray-800">Cash on Delivery</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="form-radio h-5 w-5 text-yellow-500 mr-3" />
            <span className="font-medium text-gray-800">Credit/Debit Card</span>
          </label>
        </div>
      </div>

      {paymentMethod === "cod" ? (
        <form onSubmit={handleCODSubmit}>
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Full Name" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
            <input type="email" placeholder="Email Address" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
            <textarea placeholder="Delivery Address" required rows="3" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"></textarea>
          </div>
          <button disabled={paymentLoading} type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full w-full shadow-md transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95">
            {paymentLoading ? "Processing..." : "Place Order (Cash on Delivery)"}
          </button>
        </form>
      ) : (
        <div className="border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-inner">
          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#eab308' } } }}>
              <CheckoutForm orderData={orderSummary} onSuccess={handleStripeSuccess} onError={(err) => setStatusMsg({ type: "error", text: err })} />
            </Elements>
          )}
          {paymentLoading && !clientSecret && (
            <div className="text-center py-4 text-gray-500 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-2"></div>
              Loading secure payment gateway...
            </div>
          )}
        </div>
      )}

      {statusMsg && (
        <div className={`mt-6 p-4 rounded-lg text-center font-medium ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}

export default Checkout;