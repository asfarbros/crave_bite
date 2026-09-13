import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => {
          navigate("/");
          window.location.reload(); // To update Navbar state easily
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">

        {/* Branded side panel */}
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold pacifico text-yellow-400 mb-4">CraveBite</h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sign in to pick up right where you left off — your cart, your orders, your taste.
            </p>
          </div>

          <div className="space-y-5 my-10">
            {[
              { icon: "🚀", text: "Fast, reliable delivery" },
              { icon: "🎁", text: "Exclusive member offers" },
              { icon: "📦", text: "Track orders in real time" },
              { icon: "🧠", text: "AI-powered recommendations" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">{f.icon}</span>
                <p className="text-sm text-gray-200">{f.text}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-xs">New here? Creating an account takes less than a minute.</p>
        </div>

        {/* Form side */}
        <div className="md:col-span-3 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-500">Sign in to your account to continue</p>
          </div>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-yellow-600 hover:text-yellow-700">Forgot your password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center space-y-2 mt-6">
            <p className="text-sm text-gray-500">
              Are you an admin? <Link to="/admin-login" className="font-semibold text-yellow-600 hover:text-yellow-700">Admin Login</Link>
            </p>
            <p className="text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="font-semibold text-yellow-600 hover:text-yellow-700">Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
