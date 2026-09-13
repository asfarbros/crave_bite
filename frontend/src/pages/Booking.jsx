import React, { useState, useEffect } from "react";

const TABLE_TYPES = [
  { id: "vip", name: "VIP Lounge", seats: "2–4 guests", icon: "👑", vibe: "Premium & Private", desc: "Elevated seating with dedicated service." },
  { id: "window", name: "Window Seat", seats: "2–4 guests", icon: "🌇", vibe: "Scenic & Romantic", desc: "Perfect for date nights and golden hour." },
  { id: "family", name: "Family Table", seats: "4–6 guests", icon: "👨‍👩‍👧‍👦", vibe: "Spacious & Casual", desc: "Room to spread out with the whole crew." },
  { id: "bar", name: "Bar Counter", seats: "1–2 guests", icon: "🍹", vibe: "Casual & Social", desc: "Grab a seat by the action." },
  { id: "booth", name: "Private Booth", seats: "4–8 guests", icon: "🛋️", vibe: "Cozy & Enclosed", desc: "Tucked-away comfort for groups." },
];

const TIME_SLOTS = ["12:00 PM", "1:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];

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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const readyToConfirm = selectedTable && formData.date && formData.time && formData.name && formData.phone && formData.email;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!readyToConfirm) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Time</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot }))}
                      className={`text-xs font-semibold py-2 rounded-lg transition ${
                        formData.time === slot
                          ? "bg-yellow-400 text-black shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-yellow-50 border border-gray-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Table vibe */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Choose your vibe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TABLE_TYPES.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTable(table)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg scale-[1.02]"
                        : "border-gray-100 hover:border-yellow-200 hover:shadow-md"
                    }`}
                  >
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
