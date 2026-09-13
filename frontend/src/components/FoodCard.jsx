import React, { useEffect, useState } from "react";

function FoodCard({ item }) {
  const [notification, setNotification] =
    useState("");

  const getUserId = () => {
    const userStr =
      localStorage.getItem("user");

    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);

      return user?.id || user?._id || null;
    } catch {
      return null;
    }
  };

  // ---------------------------------------------------
  // Track food view
  // ---------------------------------------------------

  useEffect(() => {
    const userId = getUserId();

    if (!userId || !item?._id) {
      return;
    }

    fetch(
      "http://localhost:5000/api/taste-profile/track",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          foodId: item._id,
          action: "view"
        })
      }
    ).catch((error) => {
      console.error(
        "Taste tracking error:",
        error
      );
    });
  }, [item?._id]);

  // ---------------------------------------------------
  // Add to cart
  // ---------------------------------------------------

  const addToCart = async () => {
    const userId = getUserId();

    if (!userId) {
      setNotification(
        "Please login before adding items to cart."
      );

      setTimeout(
        () => setNotification(""),
        3000
      );

      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: item.name,
            price: item.price,
            quantity: 1,
            userId
          })
        }
      );

      const data = await response.json();

      if (data.success || response.ok) {

        setNotification(
          `${item.name} added to cart!`
        );

        // Stronger preference signal.
        fetch(
          "http://localhost:5000/api/taste-profile/track",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId,
              foodId: item._id,
              action: "view"
            })
          }
        ).catch(() => {});
      } else {
        setNotification(
          data.message ||
            "Error adding item"
        );
      }
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error
      );

      setNotification(
        "Unable to add item."
      );
    }

    setTimeout(
      () => setNotification(""),
      3000
    );
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group">

      <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

      <img
        src={item.image || item.imageUrl}
        alt={item.name}
        className="rounded-xl mb-4 w-full h-48 object-cover shadow-md"
      />

      <h2 className="text-2xl font-bold text-yellow-500 mb-2">
        {item.name}
      </h2>

      <p className="text-sm text-gray-700 mb-4 h-10">
        {item.description}
      </p>

      <div className="flex justify-between items-center mt-4">

        <span className="text-xl font-bold text-gray-900">
          ₹{item.price}
        </span>

        <button
          onClick={addToCart}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-5 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 relative z-10"
        >
          Add to Cart
        </button>

      </div>

      {notification && (
        <div className="fixed top-20 right-4 px-6 py-3 rounded-lg shadow-2xl text-sm font-bold z-[100] bg-green-500 text-white">
          {notification}
        </div>
      )}

    </div>
  );
}

export default FoodCard;