import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import OfferPopup from "./components/OfferPopup";

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
import RestaurantStatus from "./components/RestaurantStatus";


const OPEN_TIME = 8 * 60 + 30; // 8:30 AM
const CLOSE_TIME = 21 * 60;    // 9:00 PM


const isRestaurantOpen = () => {

    const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });

    const now = new Date(indiaTime);

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    return (
        currentMinutes >= OPEN_TIME &&
        currentMinutes < CLOSE_TIME
    );
};


function App() {

    const location = useLocation();

    const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/admin-login";

    const [isOpen, setIsOpen] =
        React.useState(isRestaurantOpen());


    React.useEffect(() => {

        const checkRestaurantStatus = () => {
            setIsOpen(isRestaurantOpen());
        };

        // Check every 30 seconds
        const interval = setInterval(
            checkRestaurantStatus,
            30000
        );

        return () => clearInterval(interval);

    }, []);


    /*
     * ADMIN PAGES
     *
     * Admin can access the dashboard even
     * when the restaurant is closed.
     */

    if (isAdminRoute) {

        return (
            <div className="flex flex-col min-h-screen">

                <Routes>

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

            </div>
        );
    }


    /*
     * CUSTOMER WEBSITE
     *
     * If restaurant is closed,
     * show ONLY the closed board.
     */

    if (!isOpen) {

        return (
            <div className="flex flex-col min-h-screen">

                <RestaurantStatus />

            </div>
        );
    }


    /*
     * CUSTOMER WEBSITE WHEN OPEN
     */

    return (
        <div className="flex flex-col min-h-screen">

            <Navbar />

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

                </Routes>

            </main>

            <Footer />

            {/* Floating AI features */}

<TasteProfile />

<RestaurantChatbot />

{/* Time-based promotional offers */}

<OfferPopup />
        </div>
    );
}

export default App;