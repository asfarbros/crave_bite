import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { API_URL } from "../config";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ total, onSuccess, onError }) {
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
        {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
      </button>
    </form>
  );
}

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      setStatusMsg({ type: "error", text: "Failed to load your cart." });
    } finally {
      setCartLoading(false);
    }
  };

  const loadStripePayment = async () => {
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/payment/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currency: "usd" })
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
    if (paymentMethod === "card" && cartItems.length > 0 && !clientSecret) {
      loadStripePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, cartItems.length]);

  const placeBackendOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatusMsg({ type: "error", text: "You must be logged in." });
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/order/place`, {
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
      setStatusMsg({ type: "success", text: "Payment and order placed successfully!" });
      setTimeout(() => navigate("/success"), 1500);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-gray-500">Loading your order...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 mt-10 rounded-2xl shadow-md text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add something delicious before checking out.</p>
        <Link to="/menu" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105 inline-block">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-yellow-600">Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Order items + summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md order-2 lg:order-1">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Your Order</h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item._id} className="flex items-center gap-3">
                <img
                  src={item.imageUrl || "https://placehold.co/60x60/fef3c7/ca8a04?text=%F0%9F%8D%BD"}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-yellow-50"
                />
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <p className="font-semibold text-yellow-700 flex-shrink-0">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.5%)</span><span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-yellow-800">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md order-1 lg:order-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Payment Method</h3>

          <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <label className="flex items-center cursor-pointer">
              <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="form-radio h-5 w-5 text-yellow-500 mr-3" />
              <span className="font-medium text-gray-800">Cash on Delivery</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="form-radio h-5 w-5 text-yellow-500 mr-3" />
              <span className="font-medium text-gray-800">Credit/Debit Card</span>
            </label>
          </div>

          {paymentMethod === "cod" ? (
            <form onSubmit={handleCODSubmit}>
              <div className="space-y-4 mb-6">
                <input type="text" placeholder="Full Name" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                <input type="email" placeholder="Email Address" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                <textarea placeholder="Delivery Address" required rows="3" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"></textarea>
              </div>
              <button disabled={paymentLoading} type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full w-full shadow-md transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95">
                {paymentLoading ? "Processing..." : `Place Order (Cash on Delivery) — ₹${total.toFixed(2)}`}
              </button>
            </form>
          ) : (
            <div className="border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-inner">
              {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#eab308' } } }}>
                  <CheckoutForm total={total} onSuccess={handleStripeSuccess} onError={(err) => setStatusMsg({ type: "error", text: err })} />
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
      </div>
    </div>
  );
}

export default Checkout;
