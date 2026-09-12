const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

/*
  Normalize text so that:
  "Cheese-Burger", "cheese burger", "CHEESE BURGER"
  can be compared more easily.
*/
const normalize = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/*
  Words that usually don't help us identify a food.
*/
const STOP_WORDS = new Set([
  "i",
  "want",
  "would",
  "like",
  "to",
  "get",
  "give",
  "me",
  "please",
  "can",
  "you",
  "have",
  "do",
  "the",
  "a",
  "an",
  "some",
  "food",
  "dish",
  "order",
  "for",
  "is",
  "there",
  "any",
  "with",
  "and"
]);

const getKeywords = (text) => {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
};

/*
  Calculate a simple relevance score.

  Exact name match gets the highest score.
  Then word matches.
  Then category/description matches.
*/
const scoreFood = (food, keywords, normalizedQuery) => {
  const name = normalize(food.name);
  const description = normalize(food.description);
  const category = normalize(food.category);

  let score = 0;

  // Exact complete name
  if (name === normalizedQuery) {
    score += 100;
  }

  // Query contained in food name
  if (name.includes(normalizedQuery)) {
    score += 60;
  }

  keywords.forEach((keyword) => {
    if (name.includes(keyword)) {
      score += 25;
    }

    if (category.includes(keyword)) {
      score += 15;
    }

    if (description.includes(keyword)) {
      score += 8;
    }
  });

  return score;
};

/*
  GET /api/chatbot/search?q=paneer pizza

  Searches the REAL menu in MongoDB.
*/
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a food query."
      });
    }

    const foods = await Food.find({
      isAvailable: true
    }).lean();

    const normalizedQuery = normalize(query);
    const keywords = getKeywords(query);

    const scoredFoods = foods
      .map((food) => ({
        ...food,
        score: scoreFood(food, keywords, normalizedQuery)
      }))
      .filter((food) => food.score > 0)
      .sort((a, b) => b.score - a.score);

    /*
      Strong exact/close matches.
    */
    const exactMatches = scoredFoods
      .filter((food) => food.score >= 60)
      .slice(0, 5);

    /*
      Related suggestions.
    */
    const relatedMatches = scoredFoods
      .filter((food) => !exactMatches.some(
        (exact) => String(exact._id) === String(food._id)
      ))
      .slice(0, 8);

    res.json({
      success: true,
      query,
      exactMatches,
      relatedMatches
    });

  } catch (error) {
    console.error("Chatbot search error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search menu."
    });
  }
});

module.exports = router;