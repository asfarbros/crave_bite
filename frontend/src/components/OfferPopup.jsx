import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import "./OfferPopup.css";

function OfferPopup() {

    const [offers, setOffers] = useState([]);
    const [currentOffer, setCurrentOffer] = useState(null);

    const fetchOffers = async () => {

        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        // Only show offers to logged-in users
        if (!token || !user) {
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/offers/active`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (
                data.success &&
                data.offers &&
                data.offers.length > 0
            ) {

                setOffers(data.offers);

                setCurrentOffer(data.offers[0]);
            }

        } catch (error) {

            console.error(
                "Error fetching offers:",
                error
            );
        }
    };


    useEffect(() => {

        fetchOffers();

    }, []);


    const closeOffer = async () => {

        if (!currentOffer) {
            return;
        }

        const token =
            localStorage.getItem("token");

        try {

            await fetch(
                `${API_URL}/api/offers/${currentOffer._id}/seen`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Error marking offer:",
                error
            );
        }


        // Show next offer if there is one
        const remainingOffers =
            offers.filter(
                offer =>
                    offer._id !==
                    currentOffer._id
            );

        setOffers(remainingOffers);

        if (remainingOffers.length > 0) {

            setCurrentOffer(
                remainingOffers[0]
            );

        } else {

            setCurrentOffer(null);
        }
    };


    if (!currentOffer) {
        return null;
    }


    return (

        <div className="offer-overlay">

            <div className="offer-popup">

                <button
                    className="offer-close"
                    onClick={closeOffer}
                >
                    ×
                </button>


                <div className="offer-icon">
                    🎉
                </div>


                <div className="offer-badge">
                    LIMITED TIME OFFER
                </div>


                <h2>
                    {currentOffer.title}
                </h2>


                <div className="offer-discount">
                    {currentOffer.discountPercentage}% OFF
                </div>


                <p className="offer-description">
                    {currentOffer.description}
                </p>


                <div className="offer-food">
                    🍽️ {currentOffer.foodName}
                </div>


                <div className="offer-validity">

                    <span>
                        ⏰ Valid today
                    </span>

                    <strong>
                        {currentOffer.startTime}
                        {" - "}
                        {currentOffer.endTime}
                    </strong>

                </div>


                <button
                    className="offer-button"
                    onClick={closeOffer}
                >
                    Got It!
                </button>

            </div>

        </div>
    );
}

export default OfferPopup;