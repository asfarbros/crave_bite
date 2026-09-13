import React, { useState, useEffect } from "react";

function Booking() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    name: "",
    phone: "",
    email: "",
    requests: ""
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const handleTableClick = (tableData) => {
    if (tableData.booked) return;
    setSelectedTable(tableData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // In a real app we'd send this to the backend
    // Mark as booked locally
    // selectedTable.booked = true -> Not implementing persistent local state right now to simulate

    // Send email via EmailJS
    const templateParams = {
      to_name: formData.name,
      email: formData.email,
      table_name: selectedTable.name,
      booking_date: formData.date,
      booking_time: formData.time,
      seats: selectedTable.seats
    };

    if (window.emailjs) {
      window.emailjs
        .send("service_bvn3n88", "template_f79gdco", templateParams)
        .then(() => {
          console.log(`Confirmation email sent to ${formData.email}!`);
        })
        .catch((error) => {
          console.error("Email sending failed:", error);
        });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTable(null);
    setFormData({ ...formData, time: "", name: "", phone: "", email: "", requests: "" });
  };

  // Helper for rendering tables
  const Table = ({ id, seats, name, type, addedClasses, top, left, right, bottom }) => {
    const isSelected = selectedTable?.id === id;
    const isBooked = false; // Mock data
    let baseClass = "table-seat flex items-center justify-center ";

    if (type === "square") baseClass += "square-table w-28 h-28 ";
    if (type === "small-square") baseClass += "square-table w-24 h-24 ";
    if (type === "circular") baseClass += "circular-table w-32 h-32 ";
    if (type === "medium-circular") baseClass += "circular-table w-28 h-28 ";
    if (type === "small-circular") baseClass += "circular-table w-20 h-20 ";
    
    if (isSelected) baseClass += "selected ";
    if (isBooked) baseClass += "booked ";
    if (addedClasses) baseClass += addedClasses;

    return (
      <div 
        className={baseClass} 
        style={{ position: 'absolute', top, left, right, bottom }}
        onClick={() => handleTableClick({ id, seats, name, booked: isBooked })}
        data-table={id}
      >
        <div className="table-number text-sm">
          {name.replace("Table ", "")}<br />{seats} seats
        </div>
        {/* Simplified seat indicators for visual parity */}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 text-gray-800 min-h-screen">
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Book Your Table</h1>
            <p className="text-gray-600 text-lg">Select your preferred table from our restaurant layout</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Restaurant Layout</h2>
            
            <div className="flex flex-wrap justify-center mb-8 gap-6 min-w-[600px]">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="w-6 h-6 rounded-full border-2 border-gray-500 legend-available"></div>
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500"></div>
                <span className="text-sm font-medium">Selected</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500"></div>
                <span className="text-sm font-medium">Booked</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="w-6 h-6 window rounded border-2 border-blue-400"></div>
                <span className="text-sm font-medium">Window</span>
              </div>
            </div>

            <div className="relative restaurant-layout rounded-xl p-8 min-h-[900px] min-w-[800px] mx-auto overflow-hidden">
              <div className="absolute top-4 left-4 area-label">VIP AREA</div>
              <div className="absolute top-4 right-32 area-label">BAR AREA</div>
              <div className="absolute bottom-4 left-4 area-label">MAIN DINING</div>
              <div className="absolute bottom-4 right-4 area-label">PRIVATE BOOTHS</div>

              {/* VIP Area */}
              <Table id="1" seats="4" name="VIP 1" type="square" top="5rem" left="2rem" />
              <Table id="2" seats="4" name="VIP 2" type="square" top="14rem" left="2rem" />
              <Table id="3" seats="4" name="VIP 3" type="square" top="23rem" left="2rem" />

              {/* Center Circular Tables */}
              <Table id="4" seats="6" name="Table 4" type="circular" top="5rem" left="50%" addedClasses="-translate-x-1/2" />
              <Table id="5" seats="6" name="Table 5" type="circular" top="15rem" left="50%" addedClasses="-translate-x-1/2" />
              <Table id="6" seats="6" name="Table 6" type="circular" top="25rem" left="50%" addedClasses="-translate-x-1/2" />

              {/* Bar Area */}
              <Table id="7" seats="2" name="BAR 1" type="small-circular" top="8rem" right="8rem" />
              <Table id="8" seats="2" name="BAR 2" type="small-circular" top="14rem" right="8rem" />
              <Table id="9" seats="2" name="BAR 3" type="small-circular" top="20rem" right="8rem" />

              {/* Booths Left */}
              <Table id="10" seats="4" name="BOOTH 1" type="small-square" bottom="12rem" left="2rem" />
              <Table id="11" seats="4" name="BOOTH 2" type="small-square" bottom="4rem" left="2rem" />

              {/* Lower Circular Tables */}
              <Table id="12" seats="6" name="Table 7" type="medium-circular" bottom="14rem" left="50%" addedClasses="-translate-x-1/2" />
              <Table id="13" seats="6" name="Table 8" type="medium-circular" bottom="4rem" left="50%" addedClasses="-translate-x-1/2" />

              {/* Booths Right */}
              <Table id="14" seats="4" name="BOOTH 3" type="small-square" bottom="12rem" right="2rem" />
              <Table id="15" seats="4" name="BOOTH 4" type="small-square" bottom="4rem" right="2rem" />

              <div className="absolute bottom-4 right-4 restroom text-white px-6 py-3 rounded-lg text-sm font-bold">🚻 RESTROOM</div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 entrance text-white px-6 py-3 rounded-lg text-sm font-bold">🚪 ENTRANCE</div>
            </div>
          </div>

          <form id="booking-form-element" className="bg-white rounded-2xl shadow-2xl p-8" onSubmit={handleBookingSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Booking Details</h2>
            
            {!selectedTable ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <p className="text-lg">Please select a table from the layout above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Table</label>
                  <input type="text" readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold" value={selectedTable.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
                  <input type="text" readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold" value={`${selectedTable.seats} seats`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" required>
                    <option value="">Select time</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea name="requests" value={formData.requests} onChange={handleInputChange} placeholder="Any special requests or dietary requirements" rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                </div>
                <div className="md:col-span-2 mt-8 text-center">
                  <button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 hover:scale-105 transform">
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </form>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 booking-success shadow-2xl relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-green-600 mb-3">Booking Successful!</h3>
                  <p className="text-gray-600 mb-6">Your table has been reserved. We'll send you a confirmation shortly.</p>
                  <div className="space-y-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-left">
                    <p><strong>Table:</strong> <span className="text-gray-700">{selectedTable?.name}</span></p>
                    <p><strong>Date:</strong> <span className="text-gray-700">{formData.date}</span></p>
                    <p><strong>Time:</strong> <span className="text-gray-700">{formData.time}</span></p>
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

export default Booking;
