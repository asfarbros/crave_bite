const Food = require('../models/Food');
const TasteProfile = require('../models/TasteProfile');

/*
|--------------------------------------------------------------------------
| Heuristic keyword tagging
|--------------------------------------------------------------------------
| The Food model has no dedicated cuisine/protein/spice fields, so these
| are inferred from name + description text. Good enough for lightweight
| personalization without touching the existing Food schema.
*/

const PROTEIN_KEYWORDS = ['chicken', 'mutton', 'fish', 'prawn', 'egg', 'beef', 'pork', 'paneer', 'tofu'];

const CUISINE_KEYWORDS = {
    indian: ['biriyani', 'dosa', 'naan', 'masala', 'chaat', 'curry', 'tandoori'],
    italian: ['pasta', 'pizza', 'alfredo'],
    chinese: ['noodles', 'fried rice', 'momos', 'manchurian'],
    american: ['burger', 'sandwich', 'fries'],
    dessert: ['ice cream', 'cheesecake', 'cake', 'chocolate']
};

const SPICY_KEYWORDS = ['spicy', 'masala', 'chilli', 'chili', 'pepper', 'tandoori'];
const CHEESE_KEYWORDS = ['cheese', 'cheesy', 'paneer'];
const HEALTHY_KEYWORDS = ['salad', 'grilled', 'steamed', 'soup', 'fresh'];

function textOf(food) {
    return `${food.name || ''} ${food.description || ''}`.toLowerCase();
}

function findProtein(text) {
    return PROTEIN_KEYWORDS.find((keyword) => text.includes(keyword)) || null;
}

function findCuisine(text) {
    for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
            return cuisine;
        }
    }
    return null;
}

function countHits(text, keywords) {
    return keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

// Action weights: stronger signals (an actual order) move the profile more than a view.
const ACTION_WEIGHTS = {
    view: 1,
    search: 1,
    order: 5,
    skip: -1
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function bumpMapCounter(map, key, delta) {
    if (!key) return;
    const current = map.get(key) || 0;
    map.set(key, Math.max(0, current + delta));
}

async function updateTasteProfile(userId, food, action) {
    const weight = ACTION_WEIGHTS[action] ?? 0;
    const text = textOf(food);

    let profile = await TasteProfile.findOne({ userId });
    if (!profile) {
        profile = new TasteProfile({ userId });
    }

    bumpMapCounter(profile.categories, food.category, weight);
    bumpMapCounter(profile.cuisines, findCuisine(text), weight);
    bumpMapCounter(profile.proteins, findProtein(text), weight);

    const spiceHits = countHits(text, SPICY_KEYWORDS);
    const cheeseHits = countHits(text, CHEESE_KEYWORDS);
    const healthyHits = countHits(text, HEALTHY_KEYWORDS);

    if (spiceHits > 0) {
        profile.spiceLevel = clamp(profile.spiceLevel + weight * 0.5, 0, 10);
    }
    if (cheeseHits > 0) {
        profile.cheesePreference = clamp(profile.cheesePreference + weight * 0.5, 0, 10);
    }
    if (healthyHits > 0) {
        profile.healthyPreference = clamp(profile.healthyPreference + weight * 0.5, 0, 10);
    }

    if (weight > 0) {
        const previousTotal = profile.averagePrice * profile.totalInteractions;
        profile.totalInteractions += weight;
        profile.averagePrice = (previousTotal + food.price * weight) / profile.totalInteractions;
    }

    await profile.save();
    return profile;
}

function topEntry(map) {
    if (!map || map.size === 0) return null;
    let best = null;
    for (const [key, value] of map.entries()) {
        if (!best || value > best.value) {
            best = { key, value };
        }
    }
    return best?.key || null;
}

async function getRecommendations(userId, limit) {
    const profile = await TasteProfile.findOne({ userId });
    const foods = await Food.find({ isAvailable: true }).lean();

    if (!profile || profile.totalInteractions === 0) {
        // No signal yet — fall back to the newest available items.
        return foods
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
            .map((food) => ({ ...food, recommendationReason: 'Popular on CraveBite' }));
    }

    const topCategory = topEntry(profile.categories);
    const topCuisine = topEntry(profile.cuisines);
    const topProtein = topEntry(profile.proteins);

    const scored = foods.map((food) => {
        const text = textOf(food);
        let score = 0;
        let reason = null;

        if (topCategory && food.category === topCategory) {
            score += 30;
            reason = `Because you like ${topCategory}`;
        }
        if (topCuisine && findCuisine(text) === topCuisine) {
            score += 20;
            reason = reason || `Matches your taste for ${topCuisine} food`;
        }
        if (topProtein && findProtein(text) === topProtein) {
            score += 15;
            reason = reason || `You often order ${topProtein}`;
        }
        if (profile.averagePrice > 0) {
            const priceDiff = Math.abs(food.price - profile.averagePrice);
            score += Math.max(0, 10 - priceDiff / 20);
        }

        return { ...food, score, recommendationReason: reason || 'Picked based on your activity' };
    });

    return scored
        .filter((food) => food.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

module.exports = {
    updateTasteProfile,
    getRecommendations
};
