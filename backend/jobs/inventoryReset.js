const cron = require("node-cron");
const Food = require("../models/Food");

const INITIAL_STOCK = 10;

const startInventoryResetJob = () => {
    cron.schedule(
        "0 0 * * *",
        async () => {
            try {
                console.log("🔄 Starting daily inventory reset...");

                const result = await Food.updateMany(
                    {},
                    {
                        $set: {
                            stockQuantity: INITIAL_STOCK,
                            isAvailable: true
                        }
                    }
                );

                console.log(
                    `✅ Inventory reset completed. ${result.modifiedCount} food item(s) reset to ${INITIAL_STOCK}.`
                );
            } catch (error) {
                console.error("❌ Inventory reset failed:", error);
            }
        },
        {
            timezone: "Asia/Kolkata"
        }
    );

    console.log("⏰ Daily inventory reset job started.");
};

module.exports = startInventoryResetJob;