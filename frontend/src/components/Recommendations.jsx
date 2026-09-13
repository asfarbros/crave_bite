import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-44 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-100 rounded w-full"></div>
        <div className="h-8 bg-gray-100 rounded-full w-full mt-4"></div>
      </div>
    </div>
  );
}

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/recommendations/${userId}?limit=5`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Recommendation loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification("Please login before adding items to cart.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    setAddingId(food._id);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: food.name, quantity: 1 })
      });
      const data = await res.json();
      setNotification(data.success ? `${food.name} added to cart!` : data.message || "Error adding item");
    } catch (err) {
      console.error("Add to cart error:", err);
      setNotification("Unable to add item.");
    } finally {
      setAddingId(null);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-6 bg-[#fff8e7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-7 bg-yellow-100 rounded-full w-40 mx-auto mb-4 animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  // Don't show this section for logged-out users
  // or when there are no recommendations.
  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="py-20 px-6 bg-[#fff8e7]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-5 py-2 rounded-full mb-4">
            <span className="text-xl">🧠</span>
            <span className="font-semibold text-yellow-800">AI Personalized</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800">Picked For You</h2>
          <p className="text-gray-600 mt-3">Recommendations based on your taste and activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {recommendations.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <div className="relative overflow-hidden">
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {food.category && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-yellow-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {food.category}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-800">{food.name}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-grow">{food.description}</p>

                {food.recommendationReason && (
                  <div className="mt-3 bg-yellow-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600">💡 {food.recommendationReason}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-yellow-700">₹{food.price}</span>
                  <button
                    onClick={() => handleAddToCart(food)}
                    disabled={addingId === food._id}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-full text-sm shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60"
                  >
                    {addingId === food._id ? "..." : "Add"}
                  </button>
                </div>

                <Link to="/menu" className="text-xs text-gray-400 hover:text-yellow-600 mt-3 text-center transition-colors">
                  View in menu →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div className="fixed top-20 right-4 px-6 py-3 rounded-xl shadow-2xl text-sm font-bold z-[100] bg-green-500 text-white animate-[fadeIn_0.3s_ease-out]">
          {notification}
        </div>
      )}
    </section>
  );
}

export default Recommendations;
