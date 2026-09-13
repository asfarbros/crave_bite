import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const userStr =
        localStorage.getItem("user");

      const user = userStr
        ? JSON.parse(userStr)
        : null;

      const userId =
        user?.id || user?._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/recommendations/${userId}?limit=5`
      );

      const data = await response.json();

      if (data.success) {
        setRecommendations(
          data.recommendations || []
        );
      }
    } catch (error) {
      console.error(
        "Recommendation loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-[#fff8e7]">
        <div className="text-center">
          <p className="text-gray-500">
            🧠 Creating your personalized picks...
          </p>
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
            <span className="text-xl">
              🧠
            </span>

            <span className="font-semibold text-yellow-800">
              AI Personalized
            </span>
          </div>

          <h2 className="text-4xl font-bold text-gray-800">
            Picked For You
          </h2>

          <p className="text-gray-600 mt-3">
            Recommendations based on your taste and activity
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

          {recommendations.map((food) => (

            <div
              key={food._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >

              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-full h-44 object-cover"
              />

              <div className="p-5">

                <h3 className="text-lg font-bold text-gray-800">
                  {food.name}
                </h3>

                <p className="text-sm text-gray-500 mt-2 min-h-[40px]">
                  {food.description}
                </p>

                <div className="mt-4 flex items-center justify-between">

                  <span className="text-lg font-bold text-yellow-700">
                    ₹{food.price}
                  </span>

                  <Link
                    to="/menu"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-full text-sm transition"
                  >
                    View
                  </Link>

                </div>

                {food.recommendationReason && (
                  <div className="mt-4 bg-yellow-50 rounded-lg p-3">

                    <p className="text-xs text-gray-600">
                      💡 {food.recommendationReason}
                    </p>

                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Recommendations;