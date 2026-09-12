const Food = require("../models/Food");
const TasteProfile = require("../models/TasteProfile");

// -----------------------------------------------------
// FOOD ATTRIBUTE INFERENCE
// -----------------------------------------------------

function getFoodAttributes(food) {
  const text = `${food.name} ${food.description} ${food.category}`.toLowerCase();

  let cuisine = "Other";
  let protein = "None";

  if (
    text.includes("pizza") ||
    text.includes("pasta") ||
    text.includes("italian")
  ) {
    cuisine = "Italian";
  } else if (
    text.includes("biriyani") ||
    text.includes("dosa") ||
    text.includes("naan") ||
    text.includes("chaat") ||
    text.includes("indian")
  ) {
    cuisine = "Indian";
  } else if (
    text.includes("noodle") ||
    text.includes("fried rice") ||
    text.includes("momo")
  ) {
    cuisine = "Chinese";
  } else if (
    text.includes("burger") ||
    text.includes("sandwich") ||
    text.includes("fries")
  ) {
    cuisine = "Fast Food";
  }

  if (
    text.includes("chicken") ||
    text.includes("grilled chicken") ||
    text.includes("chicken biriyani")
  ) {
    protein = "Chicken";
  } else if (
    text.includes("paneer") ||
    text.includes("vegetarian") ||
    text.includes("veg")
  ) {
    protein = "Vegetarian";
  } else if (text.includes("fish")) {
    protein = "Fish";
  } else if (text.includes("mutton")) {
    protein = "Mutton";
  }

  let spice = 5;

  if (
    text.includes("spicy") ||
    text.includes("chilli") ||
    text.includes("masala")
  ) {
    spice = 8;
  } else if (
    text.includes("mild") ||
    text.includes("creamy") ||
    text.includes("sweet")
  ) {
    spice = 3;
  }

  let cheese = 3;

  if (
    text.includes("cheese") ||
    text.includes("cheesy") ||
    text.includes("cheddar")
  ) {
    cheese = 9;
  }

  let healthy = 5;

  if (
    text.includes("salad") ||
    text.includes("healthy") ||
    text.includes("fresh")
  ) {
    healthy = 9;
  } else if (
    text.includes("burger") ||
    text.includes("fries") ||
    text.includes("pizza")
  ) {
    healthy = 3;
  }

  return {
    cuisine,
    protein,
    spice,
    cheese,
    healthy
  };
}

// -----------------------------------------------------
// HELPER
// -----------------------------------------------------

function getMapValue(map, key) {
  if (!map) return 0;

  if (map instanceof Map) {
    return map.get(key) || 0;
  }

  return map[key] || 0;
}

// -----------------------------------------------------
// UPDATE TASTE PROFILE
// -----------------------------------------------------

async function updateTasteProfile(userId, food, action = "view") {
  if (!userId || !food) return null;

  let profile = await TasteProfile.findOne({ userId });

  if (!profile) {
    profile = new TasteProfile({
      userId
    });
  }

  const attributes = getFoodAttributes(food);

  // Different actions have different strengths.
  let weight = 1;

  if (action === "order") {
    weight = 3;
  } else if (action === "view") {
    weight = 1;
  } else if (action === "search") {
    weight = 1.5;
  } else if (action === "skip") {
    weight = -2;
  }

  // ---------------------------------------------------
  // Numeric preferences
  // ---------------------------------------------------

  const learningRate = 0.15;

  if (action !== "skip") {
    profile.spiceLevel =
      profile.spiceLevel * (1 - learningRate) +
      attributes.spice * learningRate;

    profile.cheesePreference =
      profile.cheesePreference * (1 - learningRate) +
      attributes.cheese * learningRate;

    profile.healthyPreference =
      profile.healthyPreference * (1 - learningRate) +
      attributes.healthy * learningRate;
  }

  // ---------------------------------------------------
  // Cuisine
  // ---------------------------------------------------

  const currentCuisine =
    getMapValue(profile.cuisines, attributes.cuisine);

  const newCuisine = Math.max(
    0,
    Math.min(10, currentCuisine + weight)
  );

  profile.cuisines.set(attributes.cuisine, newCuisine);

  // ---------------------------------------------------
  // Protein
  // ---------------------------------------------------

  if (attributes.protein !== "None") {
    const currentProtein =
      getMapValue(profile.proteins, attributes.protein);

    const newProtein = Math.max(
      0,
      Math.min(10, currentProtein + weight)
    );

    profile.proteins.set(attributes.protein, newProtein);
  }

  // ---------------------------------------------------
  // Category
  // ---------------------------------------------------

  const category = food.category || "Other";

  const currentCategory =
    getMapValue(profile.categories, category);

  const newCategory = Math.max(
    0,
    Math.min(10, currentCategory + weight)
  );

  profile.categories.set(category, newCategory);

  // ---------------------------------------------------
  // Average price
  // ---------------------------------------------------

  if (action === "order") {
    if (profile.averagePrice === 0) {
      profile.averagePrice = food.price;
    } else {
      profile.averagePrice =
        profile.averagePrice * 0.8 +
        food.price * 0.2;
    }

    profile.totalOrders += 1;
  }

  profile.totalInteractions += 1;
  profile.lastUpdated = new Date();

  await profile.save();

  return profile;
}

// -----------------------------------------------------
// GENERATE RECOMMENDATIONS
// -----------------------------------------------------

async function getRecommendations(userId, limit = 5) {
  const foods = await Food.find({
    isAvailable: true
  }).lean();

  if (!foods.length) {
    return [];
  }

  let profile = await TasteProfile.findOne({ userId }).lean();

  // New user:
  // Show popular/general variety instead of empty section.
  if (!profile || profile.totalInteractions === 0) {
    return foods.slice(0, limit);
  }

  const averagePrice = profile.averagePrice || 250;

  const scoredFoods = foods.map((food) => {
    const attributes = getFoodAttributes(food);

    let score = 0;

    // -------------------------------------------------
    // Cuisine score
    // -------------------------------------------------

    const cuisineScore = getMapValue(
      profile.cuisines,
      attributes.cuisine
    );

    score += cuisineScore * 4;

    // -------------------------------------------------
    // Protein score
    // -------------------------------------------------

    if (attributes.protein !== "None") {
      const proteinScore = getMapValue(
        profile.proteins,
        attributes.protein
      );

      score += proteinScore * 4;
    }

    // -------------------------------------------------
    // Category score
    // -------------------------------------------------

    const categoryScore = getMapValue(
      profile.categories,
      food.category
    );

    score += categoryScore * 2;

    // -------------------------------------------------
    // Spice similarity
    // -------------------------------------------------

    score +=
      (10 - Math.abs(profile.spiceLevel - attributes.spice)) * 1.5;

    // -------------------------------------------------
    // Cheese similarity
    // -------------------------------------------------

    score +=
      (10 -
        Math.abs(
          profile.cheesePreference - attributes.cheese
        )) * 1;

    // -------------------------------------------------
    // Healthy similarity
    // -------------------------------------------------

    score +=
      (10 -
        Math.abs(
          profile.healthyPreference - attributes.healthy
        )) * 1;

    // -------------------------------------------------
    // Price preference
    // -------------------------------------------------

    const priceDifference =
      Math.abs(food.price - averagePrice);

    score += Math.max(
      0,
      10 - priceDifference / 50
    );

    return {
      ...food,
      recommendationScore: Number(score.toFixed(2)),
      recommendationReason: getRecommendationReason(
        food,
        profile,
        attributes
      )
    };
  });

  scoredFoods.sort(
    (a, b) =>
      b.recommendationScore -
      a.recommendationScore
  );

  return scoredFoods.slice(0, limit);
}

// -----------------------------------------------------
// EXPLANATION
// -----------------------------------------------------

function getRecommendationReason(
  food,
  profile,
  attributes
) {
  const reasons = [];

  const cuisineScore = getMapValue(
    profile.cuisines,
    attributes.cuisine
  );

  if (cuisineScore >= 4) {
    reasons.push(`you enjoy ${attributes.cuisine} food`);
  }

  if (attributes.protein !== "None") {
    const proteinScore = getMapValue(
      profile.proteins,
      attributes.protein
    );

    if (proteinScore >= 4) {
      reasons.push(`you often choose ${attributes.protein}`);
    }
  }

  if (
    Math.abs(
      profile.spiceLevel - attributes.spice
    ) <= 2
  ) {
    reasons.push("it matches your spice preference");
  }

  if (
    Math.abs(
      profile.healthyPreference -
        attributes.healthy
    ) <= 2
  ) {
    reasons.push("it matches your food preferences");
  }

  if (!reasons.length) {
    return "A recommendation based on your recent activity.";
  }

  return `Recommended because ${reasons.join(" and ")}.`;
}

module.exports = {
  getFoodAttributes,
  updateTasteProfile,
  getRecommendations
};