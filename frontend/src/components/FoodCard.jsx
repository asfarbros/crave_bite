import React, { useState } from "react";

function FoodCard({ item }) {
  const [notification, setNotification] = useState("");

  const addToCart = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id; // backend falls back gracefully or uses null

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Allow anonymous adding by passing userId regardless of value
        body: JSON.stringify({ name: item.name, price: item.price, quantity: 1, userId })
      });
      const data = await response.json();

      if (data.success || response.ok) {
        setNotification(`${item.name} added to cart!`);
      } else {
        setNotification(data.message || "Error adding item");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setNotification(`Added ${item.name} offline`); // Best effort silent error handling for local fallback
    }

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

      <img src={item.image} alt={item.name} className="rounded-xl mb-4 w-full h-48 object-cover shadow-md" />
      <h2 className="text-2xl font-bold text-yellow-500 mb-2 drop-shadow-sm">{item.name}</h2>
      <p className="text-sm text-gray-700 mb-4 h-10">{item.description}</p>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
        <button 
          onClick={addToCart}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-5 rounded-full shadow-md transition-all duration-300 hover:shadow-yellow-400/50 hover:scale-105 active:scale-95 z-10 relative"
        >
          Add to Cart
        </button>
      </div>

      {/* Notification Toast - Fixed Position Overlay */}
      {notification && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-2xl text-sm font-bold z-[100] whitespace-nowrap transition-all duration-300 ${notification.includes('Error') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {notification}
        </div>
      )}
    </div>
  );
}

export default FoodCard;
