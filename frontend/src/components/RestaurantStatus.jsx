import React, { useEffect, useState } from "react";
import "./RestaurantStatus.css";

const OPEN_TIME = 8 * 60 + 30; // 8:30 AM
const CLOSE_TIME = 21 * 60;    // 9:00 PM

const getRestaurantStatus = () => {
    // Get current time in India (IST)
    const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });

    const now = new Date(indiaTime);

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= OPEN_TIME && currentMinutes < CLOSE_TIME;
};

function RestaurantStatus() {
    const [isOpen, setIsOpen] = useState(getRestaurantStatus());

    useEffect(() => {
        const checkStatus = () => {
            setIsOpen(getRestaurantStatus());
        };

        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    if (isOpen) {
        return (
            <div className="restaurant-open-board">
                <span className="status-dot"></span>
                <span>CraveBite is Open</span>
                <span className="open-time">
                    8:30 AM – 9:00 PM
                </span>
            </div>
        );
    }

    return (
        <div className="restaurant-closed-overlay">
            <div className="closed-board">

                <div className="closed-icon">
                    🔒
                </div>

                <h1>CraveBite is Currently Closed</h1>

                <p>
                    Our restaurant is closed right now.
                </p>

                <p className="opening-message">
                    We are open every day from
                    <strong> 8:30 AM to 9:00 PM</strong>.
                </p>

                <div className="closed-hours">
                    <span>🕐</span>
                    <span>Opening Hours</span>
                    <strong>8:30 AM – 9:00 PM</strong>
                </div>

                <p className="come-back">
                    Please come back during our operating hours.
                </p>

            </div>
        </div>
    );
}

export default RestaurantStatus;