import React, { useState, useEffect } from "react";

function Events() {
  const [selectedHall, setSelectedHall] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const halls = [
    { id: "A", name: "Hall A", price: 5000, capacity: 50, booked: false, features: ["Small gatherings", "Intimate atmosphere", "Stage for performances", "Catering included"] },
    { id: "B", name: "Hall B", price: 8000, capacity: 100, booked: false, features: ["Medium-sized events", "Professional lighting", "Audio system included", "Catering included"] },
    { id: "C", name: "Hall C", price: 12000, capacity: 150, booked: false, features: ["Large celebrations", "Premium amenities", "Full AV system", "Catering included"] }
  ];

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const handleHallClick = (hall) => {
    if (hall.booked) return;
    setSelectedHall(hall);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedHall) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHall(null);
    setFormData({ ...formData, time: "", eventType: "", guestCount: "", name: "", phone: "", email: "", requests: "" });
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 text-gray-800 min-h-screen">
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Event Halls</h1>
            <p className="text-gray-600 text-lg">Choose the perfect hall for your special event</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {halls.map((hall) => {
              const isSelected = selectedHall?.id === hall.id;
              let cardClasses = "hall-card bg-white rounded-2xl shadow-2xl p-6 border-4 cursor-pointer transition-all duration-300 hover:scale-105 ";
              if (isSelected) cardClasses += "border-transparent bg-gradient-to-r from-yellow-400 to-amber-500 text-white transform scale-105 ";
              else if (hall.booked) cardClasses += "border-gray-500 bg-gray-400 cursor-not-allowed opacity-70 ";
              else cardClasses += "border-yellow-400 ";

              return (
                <div key={hall.id} className={cardClasses} onClick={() => handleHallClick(hall)}>
                  <div className="text-center mb-4">
                    <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{hall.name}</h3>
                    <p className={`text-3xl font-bold ${isSelected ? 'text-white' : 'text-yellow-600'}`}>₹{hall.price}</p>
                    <p className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>Capacity: {hall.capacity} people</p>
                  </div>
                  <div className={`space-y-2 text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {hall.features.map((feature, i) => (
                      <p key={i}>✓ {feature}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedHall && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 overflow-x-auto">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Hall {selectedHall.id} Layout</h2>
                
                <div className="flex flex-wrap justify-center mb-8 gap-6">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                    <div className="w-6 h-6 bg-red-600 rounded border-2 border-red-700"></div>
                    <span className="text-sm font-medium">Stage</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                    <div className="w-6 h-6 bg-blue-600 rounded border-2 border-blue-700"></div>
                    <span className="text-sm font-medium">Entrance</span>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-8 min-h-[500px] border-4 border-amber-200">
                  <div className="bg-red-600 text-white px-10 py-4 rounded-lg text-sm font-bold absolute top-4 left-1/2 transform -translate-x-1/2 shadow-lg">STAGE</div>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-lg opacity-30 pointer-events-none">
                    <h1 className="text-6xl font-bold text-amber-900 border-4 border-amber-900 rounded-2xl p-6">HALL {selectedHall.id}</h1>
                  </div>

                  <div className="bg-blue-600 text-white absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-sm font-bold shadow-lg">ENTRANCE</div>
                  <div className="bg-red-500 text-white absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">KITCHEN</div>
                  <div className="bg-purple-600 text-white absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">RESTROOM</div>
                </div>
              </div>

              <form className="bg-white rounded-2xl shadow-2xl p-8" onSubmit={handleBookingSubmit}>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Event Booking Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Hall</label>
                    <input type="text" readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-700" value={selectedHall.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input type="text" readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-700" value={`₹${selectedHall.price}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
                    <select name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required>
                      <option value="">Select time</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required>
                      <option value="">Select event type</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Wedding Reception">Wedding Reception</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <input type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} max={selectedHall.capacity} placeholder={`Max ${selectedHall.capacity}`} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Your email address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <textarea name="requests" value={formData.requests} onChange={handleInputChange} placeholder="Any special requirements, dietary restrictions, or additional services needed" rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                  </div>
                  <div className="md:col-span-2 mt-8 text-center">
                    <button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 hover:scale-105 transform">
                      Confirm Event Booking
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl relative animate-fadeIn">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-green-600 mb-3">Event Booked Successfully!</h3>
                  <p className="text-gray-600 mb-6">Your event has been reserved. We'll send you a confirmation shortly.</p>
                  <div className="space-y-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-left">
                    <p><strong>Hall:</strong> <span className="text-gray-700">{selectedHall?.name}</span></p>
                    <p><strong>Date:</strong> <span className="text-gray-700">{formData.date}</span></p>
                    <p><strong>Time:</strong> <span className="text-gray-700">{formData.time}</span></p>
                    <p><strong>Event Type:</strong> <span className="text-gray-700">{formData.eventType}</span></p>
                  </div>
                  <button onClick={closeModal} className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg w-full">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Events;
