import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function BookingSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
    </div>
  );
}

function BookedHalls() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view your hall bookings.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/hall-booking/mybookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError(data.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Error loading hall bookings", err);
      setError("Network error fetching bookings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#fefae0] to-[#fdf6e3] min-h-screen text-gray-800 flex-grow py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-700 mb-2">Booked Halls</h1>
          <p className="text-gray-500">Your event hall bookings, all in one place.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <BookingSkeleton />
            <BookingSkeleton />
          </div>
        ) : error ? (
          <div className="text-center bg-white rounded-2xl shadow-md py-16 px-6">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-red-500 text-lg mb-6">{error}</p>
            <Link to="/login" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:scale-105">
              Login
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-md py-16 px-6">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl text-gray-500 mb-6">No hall bookings yet.</p>
            <Link to="/events" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:scale-105">
              Book a Hall
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-yellow-400"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-wide">
                        Booking #{(booking._id || "").slice(-6)}
                      </p>
                      <p className="text-lg font-bold text-yellow-800">
                        {booking.hallIcon} {booking.hallName}
                        <span className="text-sm font-normal text-gray-400 ml-2">{timeAgo(booking.createdAt)}</span>
                      </p>
                    </div>
                    <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-full ${
                      booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {booking.status === "confirmed" ? "✓ Confirmed" : "Cancelled"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <div><span className="text-gray-400">Date:</span> <span className="font-semibold">{booking.date}</span></div>
                    <div><span className="text-gray-400">Time:</span> <span className="font-semibold">{booking.time}</span></div>
                    <div><span className="text-gray-400">Type:</span> <span className="font-semibold">{booking.eventType}</span></div>
                    <div><span className="text-gray-400">Guests:</span> <span className="font-semibold">{booking.guestCount}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookedHalls;
