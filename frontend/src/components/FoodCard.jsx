import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function FoodCard({ item }) {

  const [notification, setNotification] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const stock = Number(item?.stockQuantity ?? 10);

  const isUnavailable =
    stock <= 0 || item?.isAvailable === false;


  const getUserId = () => {

    const userStr =
      localStorage.getItem("user");

    if (!userStr) return null;

    try {

      const user =
        JSON.parse(userStr);

      return (
        user?.id ||
        user?._id ||
        null
      );

    } catch {

      return null;
    }
  };


  // =====================================================
  // TRACK FOOD VIEW
  // =====================================================

  useEffect(() => {

    const userId = getUserId();

    if (!userId || !item?._id) {
      return;
    }

    fetch(
      `${API_URL}/api/taste-profile/track`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          userId,
          foodId: item._id,
          action: "view"
        })
      }
    ).catch(error => {

      console.error(
        "Taste tracking error:",
        error
      );

    });

  }, [item?._id]);


  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = async () => {

    const userId = getUserId();
    const token =
      localStorage.getItem("token");


    if (!userId || !token) {

      setNotification(
        "Please login before adding items to cart."
      );

      setTimeout(
        () => setNotification(""),
        3000
      );

      return;
    }


    // -----------------------------------------
    // Frontend inventory check
    // -----------------------------------------

    if (stock <= 0 || item.isAvailable === false) {

      setNotification(
        `${item.name} is currently unavailable.`
      );

      setTimeout(
        () => setNotification(""),
        3000
      );

      return;
    }


    if (quantity > stock) {

      setNotification(
        `Only ${stock} ${item.name} available.`
      );

      setTimeout(
        () => setNotification(""),
        3000
      );

      return;
    }


    setAdding(true);


    try {

      const response =
        await fetch(
          `${API_URL}/api/cart`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              name: item.name,
              quantity
            })
          }
        );


      const data =
        await response.json();


      if (data.success || response.ok) {

        setNotification(
          `${quantity} × ${item.name} added to cart!`
        );

        setQuantity(1);


        // Track interaction
        fetch(
          `${API_URL}/api/taste-profile/track`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
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


    } finally {

      setAdding(false);
    }


    setTimeout(
      () => setNotification(""),
      3000
    );
  };


  return (

    <div
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col ${
        isUnavailable
          ? "opacity-80"
          : "hover:-translate-y-1"
      }`}
    >

      {/* =========================================
          IMAGE
      ========================================= */}

      <div className="relative overflow-hidden">

        <img
          src={
            item.image ||
            item.imageUrl ||
            "https://placehold.co/400x300/fef3c7/ca8a04?text=%F0%9F%8D%BD"
          }

          alt={item.name}

          className={`w-full h-48 object-cover transition-transform duration-500 ${
            !isUnavailable
              ? "group-hover:scale-110"
              : "grayscale"
          }`}
        />


        {/* Category */}

        {item.category && (

          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-yellow-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">

            {item.category}

          </span>
        )}


        {/* =========================================
            UNAVAILABLE OVERLAY
        ========================================= */}

        {isUnavailable && (

          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">

            <span className="bg-red-600 text-white font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wide shadow-lg">

              Unavailable

            </span>

          </div>
        )}

      </div>


      {/* =========================================
          CONTENT
      ========================================= */}

      <div className="p-5 flex flex-col flex-grow">

        <h2 className="text-lg font-bold text-gray-900 mb-1">

          {item.name}

        </h2>


        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">

          {item.description}

        </p>


        {/* =========================================
            PRICE + STOCK
        ========================================= */}

        <div className="mb-4">

          <div className="flex items-center justify-between">

            <span className="text-xl font-bold text-yellow-700">

              ₹{item.price}

            </span>


            {!isUnavailable && (

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  stock <= 3
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >

                {stock <= 3
                  ? `Only ${stock} left`
                  : `${stock} available`}

              </span>
            )}

          </div>

        </div>


        {/* =========================================
            QUANTITY SELECTOR
        ========================================= */}

        {!isUnavailable && (

          <div className="flex items-center justify-between mb-4">

            <span className="text-sm font-semibold text-gray-600">

              Quantity

            </span>


            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-1 py-1 border border-gray-200">

              {/* Minus */}

              <button
                onClick={() =>
                  setQuantity(
                    q => Math.max(1, q - 1)
                  )
                }

                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold transition"

                aria-label="Decrease quantity"
              >

                −

              </button>


              <span className="w-5 text-center text-sm font-semibold">

                {quantity}

              </span>


              {/* Plus */}

              <button
                onClick={() =>
                  setQuantity(
                    q => Math.min(stock, q + 1)
                  )
                }

                disabled={quantity >= stock}

                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"

                aria-label="Increase quantity"
              >

                +

              </button>

            </div>

          </div>
        )}


        {/* =========================================
            ADD TO CART
        ========================================= */}

        <button
          onClick={addToCart}

          disabled={
            adding ||
            isUnavailable
          }

          className={`w-full font-bold py-2.5 rounded-full shadow-sm transition-all duration-300 ${
            isUnavailable
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 text-black hover:scale-[1.02] active:scale-95"
          } disabled:opacity-60`}
        >

          {isUnavailable
            ? "Unavailable"
            : adding
              ? "Adding..."
              : "Add to Cart"}

        </button>

      </div>


      {/* =========================================
          NOTIFICATION
      ========================================= */}

      {notification && (

        <div className="fixed top-20 right-4 px-6 py-3 rounded-xl shadow-2xl text-sm font-bold z-[100] bg-green-500 text-white">

          {notification}

        </div>
      )}

    </div>
  );
}

export default FoodCard;