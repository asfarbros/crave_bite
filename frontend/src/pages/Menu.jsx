import React from "react";
import menuItems from "../data/menuData";
import FoodCard from "../components/FoodCard";

function Menu() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
      {/* Header */}
      <header className="text-center py-10">
        <h1 className="text-5xl text-yellow-400 drop-shadow-md pacifico">Our Delicious Menu</h1>
        <p className="text-gray-300 mt-4 text-lg">Pick your favorite dishes and enjoy!</p>
      </header>

      {/* Menu Grid */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-8 pb-16 max-w-7xl mx-auto">
        {menuItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </main>
    </div>
  );
}

export default Menu;
