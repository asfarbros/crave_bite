const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const OfferSeen = require("../models/OfferSeen");
const { protect } = require("../middleware/auth");


// Convert "08:00" → minutes
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
};


// Get current IST time
const getCurrentIST = () => {
    return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });
};


// GET active offers that the current user has NOT seen today
router.get("/active", protect, async (req, res) => {

    try {

        const indiaTime = new Date(getCurrentIST());

        const currentMinutes =
            indiaTime.getHours() * 60 +
            indiaTime.getMinutes();

        const today =
            `${indiaTime.getFullYear()}-${String(
                indiaTime.getMonth() + 1
            ).padStart(2, "0")}-${String(
                indiaTime.getDate()
            ).padStart(2, "0")}`;


        const allOffers = await Offer.find({
            isActive: true
        });


        const activeOffers = allOffers.filter((offer) => {

            const start = timeToMinutes(
                offer.startTime
            );

            const end = timeToMinutes(
                offer.endTime
            );

            return (
                currentMinutes >= start &&
                currentMinutes < end
            );
        });


        const seenOffers = await OfferSeen.find({
            userId: req.user.id,
            seenDate: today
        });


        const seenOfferIds = new Set(
            seenOffers.map(
                item => item.offerId.toString()
            )
        );


        const unseenOffers = activeOffers.filter(
            offer =>
                !seenOfferIds.has(
                    offer._id.toString()
                )
        );


        res.json({
            success: true,
            offers: unseenOffers
        });

    } catch (error) {

        console.error(
            "Error fetching active offers:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch offers."
        });
    }
});


// Mark an offer as seen
router.post("/:offerId/seen", protect, async (req, res) => {

    try {

        const indiaTime = new Date(
            getCurrentIST()
        );

        const today =
            `${indiaTime.getFullYear()}-${String(
                indiaTime.getMonth() + 1
            ).padStart(2, "0")}-${String(
                indiaTime.getDate()
            ).padStart(2, "0")}`;


        await OfferSeen.findOneAndUpdate(
            {
                userId: req.user.id,
                offerId: req.params.offerId,
                seenDate: today
            },
            {
                userId: req.user.id,
                offerId: req.params.offerId,
                seenDate: today
            },
            {
                upsert: true,
                new: true
            }
        );


        res.json({
            success: true,
            message: "Offer marked as seen."
        });

    } catch (error) {

        console.error(
            "Error marking offer as seen:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to mark offer as seen."
        });
    }
});


module.exports = router;