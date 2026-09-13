import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold pacifico text-yellow-500">
          CraveBite
        </Link>
        <nav className="space-x-4 text-gray-700 font-medium flex items-center">
          <Link to="/" className="hover:text-yellow-500">Home</Link>
          <Link to="/menu" className="hover:text-yellow-500">Order</Link>
          <Link to="/booking" className="hover:text-yellow-500">Booking</Link>
          <Link to="/events" className="hover:text-yellow-500">Events</Link>
          <Link to="/cart" className="hover:text-yellow-500">Cart</Link>
          
          {user && (
            <Link to="/myorders" className="hover:text-yellow-500">My Orders</Link>
          )}

          {!user ? (
            <div className="inline-flex space-x-2">
              <Link to="/login" className="text-yellow-600 hover:text-yellow-500 font-medium">Login</Link>
              <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium transition-all duration-300">Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-yellow-600 font-medium">Welcome, {user.name}</span>
              <button 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
