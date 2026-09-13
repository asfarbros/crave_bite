import React, { useState } from "react";
import Recommendations from "../components/Recommendations";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const FAVORITES = [
  {
    name: "Juicy Burger",
    price: 249,
    category: "Fast Food",
    description: "Grilled to perfection with crispy fries.",
    imageUrl: "https://res.cloudinary.com/dzybsizjk/image/upload/cravebite_foods/rmkqysrfz5wik4blh5zg.jpg"
  },
  {
    name: "Cheesy Pizza",
    price: 299,
    category: "Fast Food",
    description: "Loaded with cheese and love.",
    imageUrl: "https://res.cloudinary.com/dzybsizjk/image/upload/cravebite_foods/k0jxe1yivptrazu2y1da.jpg"
  },
  {
    name: "Italian Pasta",
    price: 229,
    category: "Main Course",
    description: "Creamy, spicy, and simply irresistible.",
    imageUrl: "https://res.cloudinary.com/dzybsizjk/image/upload/cravebite_foods/fy4ba2nud2fgpldrxzsu.jpg"
  }
];

function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [notification, setNotification] = useState("");

  const handleQuickAdd = async (name) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotification("Please login before adding items to cart.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, quantity: 1 })
      });
      const data = await res.json();
      setNotification(data.success ? `${name} added to cart!` : data.message || "Error adding item");
    } catch (err) {
      console.error("Quick add error:", err);
      setNotification("Unable to add item.");
    }

    setTimeout(() => setNotification(""), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      restaurant_name: "CraveBite",
    };

    if (window.emailjs) {
      window.emailjs
        .send("service_bvn3n88", "template_664ejwd", templateParams)
        .then(() => {
          setStatus("success");
          setFormData({ name: "", email: "", message: "" });
        })
        .catch(() => {
          setStatus("error");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
       console.error("EmailJS not loaded");
       setStatus("error");
       setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="h-[calc(100vh-72px)] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092')" }}
      >
        <div className="text-center bg-black/50 p-10 rounded-xl">
          <h1 className="text-white text-5xl sm:text-6xl pacifico animate-bounce mb-6">
            Satisfy Your Cravings
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <button className="bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-600 text-black font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="py-20 px-6 bg-gray-100">
        <div className="text-center mb-12">
          <span className="inline-block bg-white text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase shadow-sm">
            Crowd Favorites
          </span>
          <h2 className="text-4xl font-bold text-gray-900">Our Favorites</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {FAVORITES.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={item.name}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-yellow-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-500 mt-1.5 text-sm">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-yellow-700">₹{item.price}</span>
                  <button
                    onClick={() => handleQuickAdd(item.name)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-full text-sm shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/menu"
            className="inline-block border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-400 hover:text-black font-bold px-8 py-3 rounded-full transition-all duration-300"
          >
            View Full Menu →
          </Link>
        </div>
      </section>

      <Recommendations />

      {notification && (
        <div className="fixed top-20 right-4 px-6 py-3 rounded-xl shadow-2xl text-sm font-bold z-[100] bg-green-500 text-white animate-[fadeIn_0.3s_ease-out]">
          {notification}
        </div>
      )}

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Our Story
          </span>
          <h2 className="text-4xl font-bold mb-5 text-gray-900">About CraveBite</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            At CraveBite, we blend passion with flavor. From juicy burgers to creamy pasta, each dish is made with the
            freshest ingredients and a whole lot of love. Come hungry, leave happy!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-14">
            {[
              { icon: "😋", value: "10K+", label: "Happy Customers" },
              { icon: "🍽️", value: "50+", label: "Menu Items" },
              { icon: "⭐", value: "4.8", label: "Average Rating" },
              { icon: "🚀", value: "30min", label: "Avg. Delivery" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-5 sm:p-6 hover:bg-yellow-50 transition-colors duration-300">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
              Testimonials
            </span>
            <h2 className="text-4xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Priya S.", initial: "P", quote: "The best burger I've had in a long time. Perfectly grilled!", color: "from-pink-400 to-rose-500" },
              { name: "Rahul M.", initial: "R", quote: "Super fast delivery and the pasta was heavenly.", color: "from-indigo-400 to-purple-500" },
              { name: "Ananya R.", initial: "A", quote: "I keep coming back for that cheesy pizza. So addictive!", color: "from-amber-400 to-orange-500" },
            ].map((t) => (
              <div key={t.name} className="bg-white p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
                <div className="text-yellow-400 text-2xl mb-3 leading-none">★★★★★</div>
                <p className="text-gray-700 italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {t.initial}
                  </div>
                  <p className="font-semibold text-gray-800">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-white text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase shadow-sm">
              Get In Touch
            </span>
            <h2 className="text-4xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-500 mt-3">We'd love to hear from you — questions, feedback, or just to say hi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-0 bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Info panel */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-6 pacifico text-yellow-400">CraveBite</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <p className="text-gray-300 text-sm">123 Food Street, Cuisine City</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📞</span>
                    <p className="text-gray-300 text-sm">+91 98765 43210</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">✉️</span>
                    <p className="text-gray-300 text-sm">info@cravebite.com</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🕒</span>
                    <p className="text-gray-300 text-sm">Open daily, 11 AM – 11 PM</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-8">We usually reply within a few hours.</p>
            </div>

            {/* Form panel */}
            <div className="md:col-span-3 p-8 sm:p-10">
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors resize-none"
                  rows="4"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-[1.01]"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>

              {status === "success" && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ❌ Failed to send message. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
