const mongoose = require("mongoose");
require("dotenv").config();

const Offer = require("./models/Offer");

const offers = [
    {
        title: "Morning Pizza Deal 🍕",
        description: "Get 20% OFF on our Cheesy Pizza during breakfast hours!",
        foodName: "Cheesy Pizza",
        discountPercentage: 20,
        startTime: "08:00",
        endTime: "11:00",
        isActive: true
    },

    {
        title: "Burger Breakfast Special 🍔",
        description: "Enjoy 15% OFF on our Juicy Burger before noon!",
        foodName: "Juicy Burger",
        discountPercentage: 15,
        startTime: "08:00",
        endTime: "12:00",
        isActive: true
    },

    {
        title: "Pasta Lunch Offer 🍝",
        description: "Get 10% OFF on Italian Pasta during lunch hours!",
        foodName: "Italian Pasta",
        discountPercentage: 10,
        startTime: "12:00",
        endTime: "15:00",
        isActive: true
    },

    {
        title: "Chicken Special 🔥",
        description: "Enjoy 20% OFF on Grilled Chicken this evening!",
        foodName: "Grilled Chicken",
        discountPercentage: 20,
        startTime: "18:00",
        endTime: "21:00",
        isActive: true
    }
];


async function seedOffers() {

    try {

        if (!process.env.MONGODB_URI) {
            console.error(
                "MONGODB_URI is missing from .env"
            );

            process.exit(1);
        }


        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "Connected to MongoDB."
        );


        for (const offer of offers) {

            const existingOffer =
                await Offer.findOne({
                    title: offer.title
                });


            if (!existingOffer) {

                await Offer.create(offer);

                console.log(
                    `Added offer: ${offer.title}`
                );

            } else {

                console.log(
                    `Offer already exists: ${offer.title}`
                );
            }
        }


        console.log(
            "\nOffer seeding completed successfully!"
        );


        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "Offer seeding failed:",
            error
        );

        process.exit(1);
    }
}


seedOffers();