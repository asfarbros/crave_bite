import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Order" },
  { to: "/booking", label: "Booking" },
  { to: "/events", label: "Events" },
];

function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [mobileBookingsOpen, setMobileBookingsOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setBookingsOpen(false);
    setMobileBookingsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadCartCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCartCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
        }
      } catch {
        // non-critical — badge just won't update
      }
    };
    loadCartCount();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold pacifico text-yellow-500 shrink-0">
          CraveBite
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
                isActive(link.to)
                  ? "text-yellow-600 bg-yellow-50"
                  : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-yellow-50 transition-colors text-xl"
            aria-label="Cart"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="text-sm font-semibold text-gray-700 max-w-[110px] truncate">{user.name}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                  <button
                    onClick={() => setBookingsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                  >
                    <span> My Bookings</span>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${bookingsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {bookingsOpen && (
                    <div className="bg-gray-50 py-1">
                      <Link to="/myorders" className="block pl-8 pr-4 py-2 text-sm text-gray-600 hover:bg-yellow-50 transition-colors">
                         Orders
                      </Link>
                      <Link to="/booked-tables" className="block pl-8 pr-4 py-2 text-sm text-gray-600 hover:bg-yellow-50 transition-colors">
                         Tables
                      </Link>
                      <Link to="/booked-halls" className="block pl-8 pr-4 py-2 text-sm text-gray-600 hover:bg-yellow-50 transition-colors">
                         Halls
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    ↪ Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? "opacity-0" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                isActive(link.to) ? "text-yellow-600 bg-yellow-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <div>
              <button
                onClick={() => setMobileBookingsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span>My Bookings</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${mobileBookingsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileBookingsOpen && (
                <div className="pl-4 space-y-1 mt-1">
                  <Link to="/myorders" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    📦 My Orders
                  </Link>
                  <Link to="/booked-tables" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    🍽️ Booked Tables
                  </Link>
                  <Link to="/booked-halls" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    🎉 Booked Halls
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-gray-100">
            {!user ? (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-yellow-600 border border-yellow-300">
                  Login
                </Link>
                <Link to="/signup" className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold bg-yellow-400 text-black">
                  Sign Up
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
