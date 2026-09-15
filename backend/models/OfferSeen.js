const mongoose = require("mongoose");

const offerSeenSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },

        offerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
            required: true
        },

        seenDate: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

offerSeenSchema.index(
    {
        userId: 1,
        offerId: 1,
        seenDate: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("OfferSeen", offerSeenSchema);