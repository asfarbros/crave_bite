import React, { useEffect, useState, useMemo } from "react";
import FoodCard from "../components/FoodCard";
import { API_URL } from "../config";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-100 rounded w-full"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </div>
    </div>
  );
}

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch(`${API_URL}/api/foods`);
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.data || []);
      } else {
        setError("Failed to load menu.");
      }
    } catch (err) {
      console.error("Menu loading error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const unique = [...new Set(menuItems.map((item) => item.category))];
    return ["All", ...unique];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="text-center pt-14 pb-8 px-6">
        <span className="inline-block bg-white text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase shadow-sm">
          Fresh &amp; Made to Order
        </span>
        <h1 className="text-5xl text-yellow-600 pacifico mb-4">Our Delicious Menu</h1>
        <p className="text-gray-500 text-lg">Pick your favorite dishes and enjoy!</p>
      </header>

      {/* Search + category filters */}
      {!loading && !error && menuItems.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mb-10 space-y-5">
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-yellow-400 text-black shadow-md scale-105"
                    : "bg-white text-gray-600 hover:bg-yellow-50 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md max-w-md mx-auto">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md max-w-md mx-auto">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-gray-500 text-lg">No food items available right now.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-gray-500 text-lg">No dishes match your search.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 text-yellow-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <FoodCard
                key={item._id}
                item={{
                  ...item,
                  id: item._id,
                  image: item.imageUrl
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Menu;
