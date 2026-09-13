const express = require("express");
const router = express.Router();

const Food = require("../models/Food");
const TasteProfile = require("../models/TasteProfile");

const {
  updateTasteProfile
} = require("../services/recommendationEngine");

// -----------------------------------------------------
// GET USER TASTE PROFILE
// -----------------------------------------------------

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let profile = await TasteProfile.findOne({
      userId
    });

    if (!profile) {
      profile = await TasteProfile.create({
        userId
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error(
      "Error fetching taste profile:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch taste profile."
    });
  }
});

// -----------------------------------------------------
// TRACK USER BEHAVIOR
// -----------------------------------------------------

router.post("/track", async (req, res) => {
  try {
    const {
      userId,
      foodId,
      action
    } = req.body;

    if (!userId || !foodId || !action) {
      return res.status(400).json({
        success: false,
        message:
          "userId, foodId and action are required."
      });
    }

    const allowedActions = [
      "view",
      "order",
      "search",
      "skip"
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action."
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found."
      });
    }

    const profile =
      await updateTasteProfile(
        userId,
        food,
        action
      );

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error(
      "Error tracking taste:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update taste profile."
    });
  }
});

module.exports = router;