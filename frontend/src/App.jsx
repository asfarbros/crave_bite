import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Booking from "./pages/Booking";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyOrders from "./pages/MyOrders";
import BookedTables from "./pages/BookedTables";
import BookedHalls from "./pages/BookedHalls";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAvailableTables from "./pages/AdminAvailableTables";
import AdminStaff from "./pages/AdminStaff";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import TasteProfile from "./components/TasteProfile";
import RestaurantChatbot from "./components/RestaurantChatbot";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">

      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/menu"
            element={<Menu />}
          />

          <Route
            path="/booking"
            element={<Booking />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/success"
            element={<Success />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/myorders"
            element={<MyOrders />}
          />

          <Route
            path="/booked-tables"
            element={<BookedTables />}
          />

          <Route
            path="/booked-halls"
            element={<BookedHalls />}
          />

          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/available-tables"
            element={<AdminAvailableTables />}
          />

          <Route
            path="/admin/staff"
            element={<AdminStaff />}
          />

        </Routes>

      </main>

      {!isAdminRoute && <Footer />}

      {/* Floating AI features */}
      {!isAdminRoute && <TasteProfile />}
      {!isAdminRoute && <RestaurantChatbot />}

    </div>
  );
}

export default App;
