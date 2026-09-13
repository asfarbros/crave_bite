import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your cart");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
        setError(null);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setRemovingId(itemId);
    setItems(prev => prev.filter(item => item._id !== itemId));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.success) {
        loadCart();
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      loadCart();
    } finally {
      setRemovingId(null);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setItems(prevItems => {
      const target = prevItems.find(item => item._id === itemId);
      if (!target) return prevItems;

      const newQty = target.quantity + delta;

      if (newQty <= 0) {
        removeItem(itemId);
        return prevItems;
      }

      (async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/cart/${itemId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQty })
          });
          const data = await res.json();

          if (!data.success) {
            loadCart();
          }
        } catch (err) {
          console.error("Error updating cart:", err);
          loadCart();
        }
      })();

      return prevItems.map(item => (item._id === itemId ? { ...item, quantity: newQty } : item));
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-[#fefae0] text-[#333] flex-grow min-h-[calc(100vh-72px)] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10 text-yellow-700">Your Cart</h2>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-lg text-gray-500">Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md max-w-md mx-auto">
            <p className="text-xl text-red-500 mb-6">{error}</p>
            <Link to="/login" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition duration-300">
              Login
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md max-w-md mx-auto">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
            <Link to="/menu" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:scale-105 inline-block">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Item list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div
                  key={item._id}
                  className={`flex items-center gap-4 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${removingId === item._id ? "opacity-50" : ""}`}
                >
                  <img
                    src={item.imageUrl || "https://placehold.co/100x100/fef3c7/ca8a04?text=%F0%9F%8D%BD"}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-yellow-50"
                  />

                  <div className="flex-grow min-w-0">
                    <p className="text-lg font-bold text-yellow-800 truncate">{item.name}</p>
                    <p className="text-gray-500 text-sm">₹{item.price} each</p>
                    <p className="text-yellow-700 font-semibold mt-1">₹{item.price * item.quantity}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold shadow transition active:scale-90"
                        onClick={() => updateQuantity(item._id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold shadow transition active:scale-90"
                        onClick={() => updateQuantity(item._id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <Link
                to="/menu"
                className="inline-block mt-2 text-yellow-700 hover:text-yellow-800 font-semibold transition"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

              <div className="space-y-2 text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Items ({itemCount})</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-yellow-800">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-md hover:scale-105"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
