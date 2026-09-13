import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function TasteProfile() {
  const [profile, setProfile] =
    useState(null);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userStr =
        localStorage.getItem("user");

      if (!userStr) return;

      const user =
        JSON.parse(userStr);

      const userId =
        user?.id || user?._id;

      if (!userId) return;

      const response = await fetch(
        `${API_URL}/api/taste-profile/${userId}`
      );

      const data =
        await response.json();

      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error(
        "Taste profile error:",
        error
      );
    }
  };

  const getTopPreference = (map) => {
    if (!map) return "Not enough data";

    const entries =
      Object.entries(map);

    if (!entries.length) {
      return "Not enough data";
    }

    entries.sort(
      (a, b) => b[1] - a[1]
    );

    return entries[0][0];
  };

  if (!profile) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-white shadow-xl border border-yellow-200 px-5 py-3 rounded-full font-bold text-yellow-700 hover:scale-105 transition"
      >
        🧠 My Taste
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-6">

          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-4 text-gray-500 text-2xl"
            >
              ×
            </button>

            <div className="text-center mb-8">

              <div className="text-5xl mb-3">
                🧠
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                Your Taste Profile
              </h2>

              <p className="text-gray-500 mt-2">
                CraveBite learns from your food choices.
              </p>

            </div>

            <div className="space-y-5">

              <TasteBar
                label="🌶️ Spiciness"
                value={profile.spiceLevel}
              />

              <TasteBar
                label="🧀 Cheese"
                value={profile.cheesePreference}
              />

              <TasteBar
                label="🥗 Healthy Food"
                value={profile.healthyPreference}
              />

            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">

              <PreferenceCard
                title="Favorite Cuisine"
                value={getTopPreference(
                  profile.cuisines
                )}
              />

              <PreferenceCard
                title="Favorite Protein"
                value={getTopPreference(
                  profile.proteins
                )}
              />

              <PreferenceCard
                title="Favorite Category"
                value={getTopPreference(
                  profile.categories
                )}
              />

              <PreferenceCard
                title="Average Price"
                value={
                  profile.averagePrice
                    ? `₹${Math.round(
                        profile.averagePrice
                      )}`
                    : "Learning..."
                }
              />

            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Based on{" "}
              {profile.totalInteractions || 0}{" "}
              interactions.
            </div>

          </div>

        </div>
      )}
    </>
  );
}

function TasteBar({
  label,
  value
}) {
  const percentage =
    Math.round(
      Math.max(
        0,
        Math.min(10, value || 0)
      ) * 10
    );

  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="font-semibold text-gray-700">
          {label}
        </span>

        <span className="font-bold text-yellow-700">
          {percentage / 10}/10
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">

        <div
          className="bg-yellow-400 h-3 rounded-full transition-all"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>
  );
}

function PreferenceCard({
  title,
  value
}) {
  return (
    <div className="bg-yellow-50 rounded-xl p-4">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="font-bold text-gray-800 mt-1">
        {value}
      </p>

    </div>
  );
}

export default TasteProfile;