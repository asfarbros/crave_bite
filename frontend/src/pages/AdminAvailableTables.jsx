import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

const formatHour = (hour) => {
  const period = hour < 12 || hour === 24 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

// Must match the slot labels generated in Booking.jsx (7 AM – 11 PM, hourly)
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const start = 7 + i;
  return `${formatHour(start)} - ${formatHour(start + 1)}`;
});

function AdminAvailableTables() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  const [tables, setTables] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(TIME_SLOTS[0]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (!storedToken || !user || user.role !== "admin") {
        navigate("/");
        return;
      }
      setToken(storedToken);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/booking/tables`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTables(data.data);
      })
      .catch((err) => console.error("Error loading tables:", err));
  }, [token]);

  const loadAvailability = useCallback(() => {
    if (!token || !date || !time) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/booking/availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const map = {};
          data.data.forEach((entry) => {
            map[entry.typeId] = entry;
          });
          setAvailability(map);
        } else {
          setError(data.message || "Failed to load availability.");
        }
      })
      .catch(() => setError("Network error fetching availability."))
      .finally(() => setLoading(false));
  }, [token, date, time]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  if (!token) {
    return null;
  }

  const totalTables = tables.reduce((sum, t) => sum + t.count, 0);
  const totalFilled = tables.reduce((sum, t) => sum + (availability[t.typeId]?.booked || 0), 0);
  const totalFree = totalTables - totalFilled;
  const occupancyPct = totalTables > 0 ? Math.round((totalFilled / totalTables) * 100) : 0;

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold pacifico text-yellow-500">
            CraveBite <span className="text-lg text-gray-400 font-sans">Admin</span>
          </h1>
          <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-yellow-600 transition-colors flex items-center gap-1">
            <span aria-hidden="true">←</span> Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold mb-1">Available Tables</h2>
          <p className="text-yellow-50/90">Check table availability by date and time slot.</p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">📅 Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">🕒 Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 transition-shadow"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Tables</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalTables}</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Booked</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totalFilled}</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 px-5 py-4">
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalFree}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
              <span>Overall occupancy</span>
              <span>{occupancyPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 animate-pulse">
                <div className="h-10 w-10 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 w-1/2 bg-gray-100 rounded mb-6" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">No table types found.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 mb-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-100 border-2 border-green-300 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-100 border-2 border-red-300 inline-block" /> Booked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables.map((table) => {
                const info = availability[table.typeId];
                const bookedNumbers = new Set(info?.bookedNumbers || []);
                const booked = info?.booked ?? 0;
                const count = table.count;
                const full = booked >= count;

                return (
                  <div
                    key={table._id}
                    className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-yellow-50 rounded-xl w-12 h-12 flex items-center justify-center">
                          {table.icon}
                        </span>
                        <div>
                          <p className="font-bold text-gray-800">{table.name}</p>
                          <p className="text-xs text-gray-400">{table.seats}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        full ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {booked} / {count} filled
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: count }, (_, i) => i + 1).map((num) => {
                        const isBooked = bookedNumbers.has(num);
                        return (
                          <div
                            key={num}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-transform hover:scale-105 ${
                              isBooked
                                ? "bg-red-100 border-red-300 text-red-700"
                                : "bg-green-100 border-green-300 text-green-700"
                            }`}
                            title={isBooked ? `Table ${num} — Booked` : `Table ${num} — Available`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminAvailableTables;
