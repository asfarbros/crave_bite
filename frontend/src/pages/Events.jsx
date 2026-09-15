import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const HALLS = [
  {
    id: "A",
    name: "Hall A",
    price: 5000,
    capacity: 50,
    gradient: "from-pink-400 to-rose-500",
    icon: "🎂",
    features: ["Intimate atmosphere", "Stage for performances", "Catering included"]
  },
  {
    id: "B",
    name: "Hall B",
    price: 8000,
    capacity: 100,
    gradient: "from-indigo-400 to-purple-500",
    icon: "🎊",
    features: ["Professional lighting", "Audio system included", "Catering included"]
  },
  {
    id: "C",
    name: "Hall C",
    price: 12000,
    capacity: 150,
    gradient: "from-amber-400 to-orange-500",
    icon: "🥂",
    features: ["Premium amenities", "Full AV system", "Catering included"]
  }
];

const formatSimpleHour = (hour) => {
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00`;
};

// Boundaries (24-hour) between which event slots run: 10-12, 12-3, 3-6, 6-8, 8-10
const TIME_BOUNDARIES = [10, 12, 15, 18, 20, 22];
const TIME_SLOTS = TIME_BOUNDARIES.slice(0, -1).map((start, i) => {
  const end = TIME_BOUNDARIES[i + 1];
  return { label: `${formatSimpleHour(start)}-${formatSimpleHour(end)}`, startHour: start };
});

const isTodayDate = (dateStr) => dateStr === new Date().toISOString().split("T")[0];

const EVENT_TYPES = ["Birthday Party", "Corporate Event", "Wedding Reception", "Anniversary", "Other"];

function Events() {
  const [selectedHall, setSelectedHall] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState({});
  const [availabilityError, setAvailabilityError] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    eventType: "",
    guestCount: "",
    name: "",
    phone: "",
    email: "",
    requests: ""
  });

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

    fetch(`${API_URL}/api/hall-booking/availability?date=${encodeURIComponent(formData.date)}&time=${encodeURIComponent(formData.time)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          const map = {};
          data.data.forEach((entry) => {
            map[entry.hallId] = entry;
          });
          setAvailability(map);
        } else {
          setAvailabilityError("Couldn't load hall availability.");
        }
      })
      .catch(() => {
        if (!cancelled) setAvailabilityError("Couldn't load hall availability.");
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

  const hasSlot = Boolean(formData.date && formData.time);

  const handleSelectHall = (hall) => {
    const info = availability[hall.id];
    if (hasSlot && info && !info.isAvailable) return;
    setSelectedHall(hall);
  };

  const readyToConfirm = selectedHall && formData.date && formData.time && formData.eventType && formData.guestCount && formData.name && formData.phone && formData.email;

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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/hall-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hallId: selectedHall.id,
          date: formData.date,
          time: formData.time,
          eventType: formData.eventType,
          guestCount: formData.guestCount,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          requests: formData.requests
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "This hall just got booked. Please pick another.");
        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Hall booking request failed:", error);
      alert("Something went wrong while confirming your booking. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHall(null);
    setFormData((prev) => ({ ...prev, time: "", eventType: "", guestCount: "", name: "", phone: "", email: "", requests: "" }));
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-gray-800 min-h-screen">
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-white text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm mb-4 tracking-wide uppercase">
              Celebrate With Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent pacifico">
              Event Halls
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Choose the perfect space for your celebration.
            </p>
          </div>

          {/* Step 1: Event details */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
              When's your event?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Event Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Number of Guests</label>
                <input type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} max={selectedHall?.capacity} placeholder={selectedHall ? `Max ${selectedHall.capacity}` : ""} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50">
                  <option value="">Select type</option>
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Event Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const disabled = isSlotPast(slot.startHour);
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={disabled}
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot.label }))}
                      className={`text-xs font-semibold py-2.5 rounded-lg transition ${
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

          {/* Step 2: Hall selection */}
          <div className={`mb-8 transition-opacity duration-500 ${hasSlot ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Choose your hall
            </h2>
            {!hasSlot && (
              <p className="text-sm text-gray-500 mb-4">Pick a date and time above to see hall availability.</p>
            )}
            {availabilityError && (
              <p className="text-sm text-red-500 mb-4">{availabilityError}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HALLS.map((hall) => {
                const isSelected = selectedHall?.id === hall.id;
                const info = availability[hall.id];
                const isAvailable = !hasSlot || !info || info.isAvailable;

                return (
                  <button
                    key={hall.id}
                    type="button"
                    onClick={() => handleSelectHall(hall)}
                    disabled={hasSlot && !isAvailable}
                    className={`text-left rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isSelected
                        ? "ring-4 ring-yellow-400 scale-[1.02]"
                        : hasSlot && !isAvailable
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-2xl hover:scale-[1.01]"
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${hall.gradient} p-6 text-white relative`}>
                      {hasSlot && (
                        <div className="flex justify-end mb-2">
                          <span
                            className={`inline-block text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
                              isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isAvailable ? "Available" : "Fully Booked"}
                          </span>
                        </div>
                      )}
                      <div className="text-5xl mb-2">{hall.icon}</div>
                      <h3 className="text-2xl font-bold">{hall.name}</h3>
                      <p className="text-white/80 text-sm">Up to {hall.capacity} guests</p>
                      {isSelected && (
                        <span className="absolute top-4 left-4 bg-white text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">✓ Selected</span>
                      )}
                    </div>
                    <div className="bg-white p-5">
                      <p className="text-2xl font-bold text-yellow-600 mb-3">₹{hall.price.toLocaleString()}</p>
                      <ul className="space-y-1.5">
                        {hall.features.map((feature, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Contact details */}
          <div className={`bg-white rounded-3xl shadow-xl p-6 sm:p-8 transition-opacity duration-500 ${selectedHall ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Your details
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Contact name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 md:col-span-2" />
                <textarea name="requests" value={formData.requests} onChange={handleInputChange} placeholder="Special requirements (optional)" rows="3" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 md:col-span-2"></textarea>
              </div>

              <button
                type="submit"
                disabled={!readyToConfirm || submitting}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {submitting ? "Confirming..." : "Confirm Event Booking"}
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
              <h3 className="text-2xl font-bold text-green-600 mb-2">Event Booked!</h3>
              <p className="text-gray-500 mb-6">We'll send a confirmation to {formData.email} shortly.</p>
              <div className="space-y-2 text-sm text-left bg-gray-50 p-5 rounded-2xl">
                <div className="flex justify-between"><span className="text-gray-500">Hall</span><span className="font-semibold">{selectedHall?.icon} {selectedHall?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{formData.date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{formData.time}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{formData.eventType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-semibold">{formData.guestCount}</span></div>
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

export default Events;
