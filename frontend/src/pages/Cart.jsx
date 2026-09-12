import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) {
        setError("Please login to view your cart");
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/api/cart?userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
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

  const updateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return; // Prevent 0 or negative

    try {
      const res = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
      });
      const data = await res.json();
      
      if (data.success) {
        // Optimistic update locally
        setItems(items.map(item => item._id === itemId ? { ...item, quantity: newQty } : item));
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#fefae0] text-[#333] flex-grow flex flex-col items-center p-6">
      <h2 className="text-4xl font-bold mt-8 mb-8 text-yellow-700">Your Cart</h2>

      {loading ? (
        <p className="text-xl text-gray-500">Loading cart...</p>
      ) : error ? (
        <p className="text-xl text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
          <Link to="/menu" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition duration-300">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          {items.map(item => (
            <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <div>
                <p className="text-lg font-semibold text-yellow-800">{item.name}</p>
                <p className="text-gray-600">
                  ₹{item.price} x <span>{item.quantity}</span>
                </p>
              </div>
              <div className="flex space-x-2 items-center">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-lg shadow transition"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  -
                </button>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-lg shadow transition"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="mt-8 text-center">
            <div className="text-2xl font-semibold text-yellow-800 mb-8">
              Total: ₹{total}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link to="/menu">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition duration-300">
                  Back to Menu
                </button>
              </Link>
              <button 
                onClick={() => navigate(`/checkout`, { state: { total } })}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
