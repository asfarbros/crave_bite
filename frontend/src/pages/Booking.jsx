import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const TABLE_TYPES = [
  { id: "vip", name: "VIP Lounge", seats: "2–4 guests", icon: "👑", vibe: "Premium & Private", desc: "Elevated seating with dedicated service." },
  { id: "window", name: "Window Seat", seats: "2–4 guests", icon: "🌇", vibe: "Scenic & Romantic", desc: "Perfect for date nights and golden hour." },
  { id: "family", name: "Family Table", seats: "4–6 guests", icon: "👨‍👩‍👧‍👦", vibe: "Spacious & Casual", desc: "Room to spread out with the whole crew." },
  { id: "bar", name: "Bar Counter", seats: "1–2 guests", icon: "🍹", vibe: "Casual & Social", desc: "Grab a seat by the action." },
  { id: "booth", name: "Private Booth", seats: "4–8 guests", icon: "🛋️", vibe: "Cozy & Enclosed", desc: "Tucked-away comfort for groups." },
];

const formatHour = (hour) => {
  const period = hour < 12 || hour === 24 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const start = 7 + i; // 7 AM to 10 PM start hours (last slot 10-11 PM)
  return { label: `${formatHour(start)} - ${formatHour(start + 1)}`, startHour: start };
});

const isTodayDate = (dateStr) => dateStr === new Date().toISOString().split("T")[0];

function Booking() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    name: "",
    phone: "",
    email: "",
    requests: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState({});
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  useEffect(() => {
    if (!formData.date || !formData.time) {
      setAvailability({});
      return;
    }

    let cancelled = false;
    setAvailabilityError("");

    fetch(`${API_URL}/api/booking/availability?date=${encodeURIComponent(formData.date)}&time=${encodeURIComponent(formData.time)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          const map = {};
          data.data.forEach((entry) => {
            map[entry.typeId] = entry;
          });
          setAvailability(map);
        } else {
          setAvailabilityError("Couldn't load table availability.");
        }
      })
      .catch(() => {
        if (!cancelled) setAvailabilityError("Couldn't load table availability.");
      });

    return () => { cancelled = true; };
  }, [formData.date, formData.time]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isSlotPast = (startHour) => isTodayDate(formData.date) && startHour <= new Date().getHours();

  useEffect(() => {
    if (!formData.time) return;
    const slot = TIME_SLOTS.find((s) => s.label === formData.time);
    if (slot && isSlotPast(slot.startHour)) {
      setFormData((prev) => ({ ...prev, time: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const handleSelectTable = (table) => {
    const info = availability[table.id];
    if (formData.date && formData.time && info && !info.isAvailable) return;
    setSelectedTable(table);
  };

  const readyToConfirm = selectedTable && formData.date && formData.time && formData.name && formData.phone && formData.email;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!readyToConfirm) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableTypeId: selectedTable.id,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          requests: formData.requests
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "That table just got booked. Please pick another.");
        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Booking request failed:", error);
      alert("Something went wrong while confirming your booking. Please try again.");
      setSubmitting(false);
      return;
    }

    const templateParams = {
      to_name: formData.name,
      email: formData.email,
      table_name: selectedTable.name,
      booking_date: formData.date,
      booking_time: formData.time,
      seats: formData.guests
    };

    if (window.emailjs) {
      window.emailjs
        .send("service_bvn3n88", "template_f79gdco", templateParams)
        .then(() => console.log(`Confirmation email sent to ${formData.email}!`))
        .catch((error) => console.error("Email sending failed:", error))
        .finally(() => setSubmitting(false));
    } else {
      setSubmitting(false);
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTable(null);
    setFormData((prev) => ({ ...prev, time: "", guests: 2, name: "", phone: "", email: "", requests: "" }));
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-gray-800 min-h-screen">
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-white text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm mb-4 tracking-wide uppercase">
              Reserve Your Spot
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent pacifico">
              Book Your Table
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Pick a vibe, a time, and we'll take care of the rest.
            </p>
          </div>

          {/* Step 1: Date, time, guests */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
              When are you coming in?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Party Size</label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Time (7 AM – 11 PM)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {TIME_SLOTS.map((slot) => {
                  const disabled = isSlotPast(slot.startHour);
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={disabled}
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot.label }))}
                      className={`text-xs font-semibold py-2 rounded-lg transition ${
                        disabled
                          ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
                          : formData.time === slot.label
                          ? "bg-yellow-400 text-black shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-yellow-50 border border-gray-200"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Table vibe */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Choose your vibe
            </h2>
            {availabilityError && (
              <p className="text-sm text-red-500 mb-3">{availabilityError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TABLE_TYPES.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const hasSlot = Boolean(formData.date && formData.time);
                const info = availability[table.id];
                const isAvailable = !hasSlot || !info || info.isAvailable;

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => handleSelectTable(table)}
                    disabled={hasSlot && !isAvailable}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg scale-[1.02]"
                        : hasSlot && !isAvailable
                        ? "border-gray-100 opacity-60 cursor-not-allowed"
                        : "border-gray-100 hover:border-yellow-200 hover:shadow-md"
                    }`}
                  >
                    {hasSlot && (
                      <div className="flex justify-end mb-3">
                        <span
                          className={`inline-block text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
                            isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isAvailable ? "Available" : "Fully Booked"}
                        </span>
                      </div>
                    )}
                    <div className="text-4xl mb-3">{table.icon}</div>
                    <p className="font-bold text-gray-800">{table.name}</p>
                    <p className="text-xs font-semibold text-yellow-600 mb-2">{table.vibe}</p>
                    <p className="text-sm text-gray-500 mb-2">{table.desc}</p>
                    <p className="text-xs text-gray-400">{table.seats}</p>
                    {isSelected && (
                      <div className="mt-3 text-yellow-600 text-sm font-bold flex items-center gap-1">
                        ✓ Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Contact details */}
          <div className={`bg-white rounded-3xl shadow-xl p-6 sm:p-8 transition-opacity duration-500 ${selectedTable ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Your details
            </h2>
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" required />
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" required />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Your email address" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 md:col-span-2" required />
              <textarea name="requests" value={formData.requests} onChange={handleInputChange} placeholder="Special requests (optional)" rows="3" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 md:col-span-2"></textarea>

              <button
                type="submit"
                disabled={!readyToConfirm || submitting}
                className="md:col-span-2 mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {submitting ? "Confirming..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-4xl">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Table Reserved!</h3>
              <p className="text-gray-500 mb-6">We'll send a confirmation to {formData.email} shortly.</p>
              <div className="space-y-2 text-sm text-left bg-gray-50 p-5 rounded-2xl">
                <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="font-semibold">{selectedTable?.icon} {selectedTable?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{formData.date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{formData.time}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Party Size</span><span className="font-semibold">{formData.guests} guests</span></div>
              </div>
              <button onClick={closeModal} className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg w-full">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
