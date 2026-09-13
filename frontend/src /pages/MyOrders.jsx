import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const res = await fetch("http://localhost:5000/api/order/myorders", {
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

  return (
    <div className="bg-[#fefae0] min-h-screen text-gray-800 flex-grow py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-700 mb-8 text-center">My Orders</h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading orders...</p>
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-red-500 text-lg">{error}</p>
            <Link to="/login" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-full transition duration-300">
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-500">No orders yet.</p>
            <Link to="/menu" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-full transition duration-300">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              return (
                <div key={order._id || idx} className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-all">
                  <div className="flex flex-col sm:flex-row justify-between mb-4 border-b pb-4">
                    <p className="text-lg font-bold text-yellow-800">
                      Order Date: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="font-semibold text-green-700 text-lg mt-2 sm:mt-0">Total: ₹{total}</p>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-center text-sm sm:text-base">
                        <span><span className="font-medium">{item.quantity}x</span> {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
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
