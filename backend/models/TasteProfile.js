const mongoose = require("mongoose");

const tasteProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // 0 - 10
    spiceLevel: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },

    cheesePreference: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },

    healthyPreference: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },

    priceSensitivity: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },

    // Cuisine preferences
    cuisines: {
      type: Map,
      of: Number,
      default: {}
    },

    // Protein preferences
    proteins: {
      type: Map,
      of: Number,
      default: {}
    },

    // Category preferences
    categories: {
      type: Map,
      of: Number,
      default: {}
    },

    // Ingredients the user repeatedly chooses
    favoriteIngredients: {
      type: [String],
      default: []
    },

    // Foods that the user has explicitly skipped
    dislikedIngredients: {
      type: [String],
      default: []
    },

    // Average amount user usually spends per item
    averagePrice: {
      type: Number,
      default: 0
    },

    totalInteractions: {
      type: Number,
      default: 0
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("TasteProfile", tasteProfileSchema);