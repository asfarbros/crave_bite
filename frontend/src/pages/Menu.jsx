import React, { useEffect, useState } from "react";
import FoodCard from "../components/FoodCard";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/foods"
      );

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">

      <header className="text-center py-10">
        <h1 className="text-5xl text-yellow-400 drop-shadow-md pacifico">
          Our Delicious Menu
        </h1>

        <p className="text-gray-300 mt-4 text-lg">
          Pick your favorite dishes and enjoy!
        </p>
      </header>

      {loading ? (
        <div className="text-center pb-20">
          <p className="text-xl">
            Loading delicious food...
          </p>
        </div>
      ) : error ? (
        <div className="text-center pb-20">
          <p className="text-red-400">
            {error}
          </p>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center pb-20">
          <p>No food items available.</p>
        </div>
      ) : (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-8 pb-16 max-w-7xl mx-auto">

          {menuItems.map((item) => (
            <FoodCard
              key={item._id}
              item={{
                ...item,
                id: item._id,
                image: item.imageUrl
              }}
            />
          ))}

        </main>
      )}

    </div>
  );
}

export default Menu;