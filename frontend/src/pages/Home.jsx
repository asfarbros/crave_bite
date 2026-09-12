import React, { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

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
        <div className="text-center bg-black bg-opacity-50 p-10 rounded-xl">
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
        <h2 className="text-3xl font-bold text-center mb-12">Our Favorites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <img src="/images/burger.jpg" className="w-full h-56 object-cover" alt="Juicy Burger" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">Juicy Burger</h3>
              <p className="text-gray-600 mt-2">Grilled to perfection with crispy fries.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <img src="/images/pizza.webp" className="w-full h-56 object-cover" alt="Cheesy Pizza" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">Cheesy Pizza</h3>
              <p className="text-gray-600 mt-2">Loaded with cheese and love.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <img src="/images/pasta.jpeg" className="w-full h-56 object-cover" alt="Italian Pasta" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">Italian Pasta</h3>
              <p className="text-gray-600 mt-2">Creamy, spicy, and simply irresistible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About CraveBite</h2>
          <p className="text-gray-700 text-lg">
            At CraveBite, we blend passion with flavor. From juicy burgers to creamy pasta, each dish is made with the
            freshest ingredients and a whole lot of love. Come hungry, leave happy!
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-gray-100 p-6 rounded-xl shadow-md">
            <p className="text-gray-700 italic">"The best burger I've had in a long time. Perfectly grilled!"</p>
            <p className="mt-4 font-semibold text-right">— Priya S.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl shadow-md">
            <p className="text-gray-700 italic">"Super fast delivery and the pasta was heavenly."</p>
            <p className="mt-4 font-semibold text-right">— Rahul M.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl shadow-md">
            <p className="text-gray-700 italic">"I keep coming back for that cheesy pizza. So addictive!"</p>
            <p className="mt-4 font-semibold text-right">— Ananya R.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-yellow-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <form className="space-y-4" onSubmit={handleContactSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows="4"
              required
            ></textarea>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-full transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {status === "success" && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p>✅ Message sent successfully! We'll get back to you soon.</p>
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p>❌ Failed to send message. Please try again.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
