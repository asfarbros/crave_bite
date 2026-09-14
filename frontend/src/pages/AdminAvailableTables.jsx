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

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold pacifico text-yellow-500">
            CraveBite <span className="text-lg text-gray-400 font-sans">Admin</span>
          </h1>
          <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-yellow-600 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Tables</h2>
        <p className="text-gray-500 mb-6">Check table availability by date and time slot.</p>

        <div className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Time Slot</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div className="bg-yellow-50 rounded-lg px-4 py-2.5 text-sm">
            <span className="text-gray-500">Overall: </span>
            <span className="font-bold text-yellow-700">{totalFilled} / {totalTables}</span>
            <span className="text-gray-500"> tables filled</span>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading availability...</p>
        ) : tables.length === 0 ? (
          <p className="text-gray-500">No table types found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((table) => {
              const info = availability[table.typeId];
              const bookedNumbers = new Set(info?.bookedNumbers || []);
              const booked = info?.booked ?? 0;
              const count = table.count;

              return (
                <div key={table._id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{table.icon}</span>
                      <div>
                        <p className="font-bold text-gray-800">{table.name}</p>
                        <p className="text-xs text-gray-400">{table.seats}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      booked >= count ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
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
                          className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border-2 ${
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
        )}
      </main>
    </div>
  );
}

export default AdminAvailableTables;
