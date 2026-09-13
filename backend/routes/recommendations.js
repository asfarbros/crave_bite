const express = require("express");
const router = express.Router();

const {
  getRecommendations
} = require("../services/recommendationEngine");

// GET /api/recommendations/:userId

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const limit =
      Math.min(
        Number(req.query.limit) || 5,
        10
      );

    const recommendations =
      await getRecommendations(
        userId,
        limit
      );

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate recommendations."
    });
  }
});

module.exports = router;