import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function OrderSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view orders.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/order/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error loading orders", err);
      setError("Network error fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  const reorder = async (order) => {
    setReorderingId(order._id);
    const token = localStorage.getItem("token");

    try {
      await Promise.all(
        order.items.map((item) =>
          fetch(`${API_URL}/api/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: item.name, quantity: item.quantity })
          })
        )
      );
      navigate("/cart");
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReorderingId(null);
    }
  };

  const totalSpent = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  return (
    <div className="bg-gradient-to-b from-[#fefae0] to-[#fdf6e3] min-h-screen text-gray-800 flex-grow py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-700 mb-2">My Orders</h1>
          <p className="text-gray-500">Your CraveBite order history, all in one place.</p>
        </div>

        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-5 text-center">
              <p className="text-3xl font-bold text-yellow-600">{orders.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-5 text-center">
              <p className="text-3xl font-bold text-green-600">₹{totalSpent}</p>
              <p className="text-sm text-gray-500 mt-1">Total Spent</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        ) : error ? (
          <div className="text-center bg-white rounded-2xl shadow-md py-16 px-6">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-red-500 text-lg mb-6">{error}</p>
            <Link to="/login" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:scale-105">
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-md py-16 px-6">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl text-gray-500 mb-6">No orders yet — your food story starts here.</p>
            <Link to="/menu" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:scale-105">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              return (
                <div
                  key={order._id || idx}
                  className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-yellow-400"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                      <div>
                        <p className="text-xs font-mono text-gray-400 uppercase tracking-wide">
                          Order #{(order._id || "").slice(-6)}
                        </p>
                        <p className="text-lg font-bold text-yellow-800">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          <span className="text-sm font-normal text-gray-400 ml-2">{timeAgo(order.createdAt)}</span>
                        </p>
                      </div>
                      <span className="self-start sm:self-auto bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        ✓ Placed
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.items.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-800 text-sm font-medium px-3 py-1.5 rounded-full">
                          <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                          {item.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="font-bold text-xl text-green-700">₹{total}</p>
                      <button
                        onClick={() => reorder(order)}
                        disabled={reorderingId === order._id}
                        className="text-sm font-bold text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-4 py-2 rounded-full transition disabled:opacity-50"
                      >
                        {reorderingId === order._id ? "Adding..." : "↻ Reorder"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
