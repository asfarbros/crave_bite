const express = require("express");
const router = express.Router();

const { GoogleGenAI, Type } = require("@google/genai");
const Food = require("../models/Food");
const CartItem = require("../models/CartItem");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| Helper: Search the actual CraveBite menu
|--------------------------------------------------------------------------
*/

async function searchMenu(query) {
    const foods = await Food.find({
        isAvailable: true,
    }).lean();

    const normalizedQuery = query
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const queryWords = normalizedQuery
        .split(" ")
        .filter((word) => word.length > 1);

    const scoredFoods = foods.map((food) => {
        const name = (food.name || "").toLowerCase();
        const category = (food.category || "").toLowerCase();
        const description = (food.description || "").toLowerCase();

        let score = 0;

        // Exact name match
        if (name === normalizedQuery) {
            score += 100;
        }

        // Name contains complete query
        if (name.includes(normalizedQuery)) {
            score += 80;
        }

        // Individual word matching
        queryWords.forEach((word) => {
            if (name.includes(word)) {
                score += 25;
            }

            if (category.includes(word)) {
                score += 15;
            }

            if (description.includes(word)) {
                score += 10;
            }
        });

        return {
            ...food,
            score,
        };
    });

    return scoredFoods
        .filter((food) => food.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
}

/*
|--------------------------------------------------------------------------
| Gemini function: search menu
|--------------------------------------------------------------------------
*/

const searchMenuFunction = {
    name: "search_menu",
    description:
        "Search the actual CraveBite restaurant menu. Use this whenever the customer asks for a food item, category, recommendation, price, or availability.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description:
                    "The food or menu request to search for, such as burger, pizza, chicken, dessert, or paneer pizza.",
            },
        },
        required: ["query"],
    },
};

/*
|--------------------------------------------------------------------------
| Gemini function: add item to cart
|--------------------------------------------------------------------------
*/

const addToCartFunction = {
    name: "add_to_cart",
    description:
        "Add an actual available CraveBite menu item to the customer's cart.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            foodId: {
                type: Type.STRING,
                description:
                    "The MongoDB ID of the food item returned by search_menu.",
            },
            quantity: {
                type: Type.INTEGER,
                description: "Number of items to add.",
            },
        },
        required: ["foodId", "quantity"],
    },
};

/*
|--------------------------------------------------------------------------
| POST /api/chatbot
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Conversation state sent from frontend
        |--------------------------------------------------------------------------
        */

        const history = Array.isArray(req.body.history)
            ? req.body.history
            : [];

        const contents = [
            ...history.map((item) => ({
                role: item.role,
                parts: [
                    {
                        text: item.text,
                    },
                ],
            })),
            {
                role: "user",
                parts: [
                    {
                        text: message,
                    },
                ],
            },
        ];

        /*
        |--------------------------------------------------------------------------
        | System instruction
        |--------------------------------------------------------------------------
        */

        const systemInstruction = `
You are CraveBite AI, the restaurant's ordering assistant.

Your job is to help customers find food, understand prices, and add food to their cart.

IMPORTANT RULES:

1. NEVER invent a food item.
2. NEVER invent a price.
3. Only recommend food items returned by the search_menu function.
4. If the exact requested food does not exist, explain that it is unavailable and suggest related items from the actual menu.
5. If the customer asks for a price, use the price returned from search_menu.
6. If the customer clearly asks to add a specific item to their cart, use add_to_cart.
7. If the customer asks for multiple quantities, use the requested quantity.
8. If the customer says "yes", "add it", "I want it", or similar after a food recommendation, add the previously recommended item.
9. Be concise and friendly.
10. Do not claim an item was added unless add_to_cart actually succeeds.
11. If the customer wants to pay or checkout after an item has been added, tell the frontend that checkout is ready.
12. You are talking about the CraveBite menu, so always use the database as the source of truth.

The frontend will provide buttons for adding items and going to checkout.
`;

        /*
        |--------------------------------------------------------------------------
        | First Gemini request
        |--------------------------------------------------------------------------
        */

        let response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction,
                tools: [
                    {
                        functionDeclarations: [
                            searchMenuFunction,
                            addToCartFunction,
                        ],
                    },
                ],
            },
        });

        /*
        |--------------------------------------------------------------------------
        | Handle Gemini function calls
        |--------------------------------------------------------------------------
        */

        let functionCalls = response.functionCalls;

        let menuResults = [];
        let addedItem = null;

        if (functionCalls && functionCalls.length > 0) {
            const functionResponses = [];

            for (const call of functionCalls) {
                /*
                |--------------------------------------------------------------------------
                | SEARCH MENU
                |--------------------------------------------------------------------------
                */

                if (call.name === "search_menu") {
                    const query = call.args.query;

                    const results = await searchMenu(query);

                    menuResults = results;

                    functionResponses.push({
                        functionResponse: {
                            name: "search_menu",
                            response: {
                                results: results.map((food) => ({
                                    id: food._id.toString(),
                                    name: food.name,
                                    description: food.description,
                                    price: food.price,
                                    category: food.category,
                                    imageUrl: food.imageUrl,
                                })),
                            },
                        },
                    });
                }

                /*
                |--------------------------------------------------------------------------
                | ADD TO CART
                |--------------------------------------------------------------------------
                */

                if (call.name === "add_to_cart") {
                    const foodId = call.args.foodId;
                    const quantity = Number(call.args.quantity || 1);

                    if (!userId) {
                        functionResponses.push({
                            functionResponse: {
                                name: "add_to_cart",
                                response: {
                                    success: false,
                                    message:
                                        "The customer must be logged in before adding items to the cart.",
                                },
                            },
                        });

                        continue;
                    }

                    const food = await Food.findOne({
                        _id: foodId,
                        isAvailable: true,
                    });

                    if (!food) {
                        functionResponses.push({
                            functionResponse: {
                                name: "add_to_cart",
                                response: {
                                    success: false,
                                    message:
                                        "This food item is currently unavailable.",
                                },
                            },
                        });

                        continue;
                    }

                    let cartItem = await CartItem.findOne({
                        name: food.name,
                        userId,
                    });

                    if (cartItem) {
                        cartItem.quantity += quantity;
                        cartItem.price = food.price;

                        await cartItem.save();
                    } else {
                        cartItem = await CartItem.create({
                            name: food.name,
                            price: food.price,
                            quantity,
                            userId,
                        });
                    }

                    addedItem = {
                        id: food._id.toString(),
                        name: food.name,
                        price: food.price,
                        quantity,
                    };

                    functionResponses.push({
                        functionResponse: {
                            name: "add_to_cart",
                            response: {
                                success: true,
                                message: `${food.name} added to cart.`,
                                item: {
                                    name: food.name,
                                    price: food.price,
                                    quantity,
                                },
                            },
                        },
                    });
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Send function results back to Gemini
            |--------------------------------------------------------------------------
            */

            response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    ...contents,
                    {
                        role: "model",
                        parts: response.candidates[0].content.parts,
                    },
                    {
                        role: "user",
                        parts: functionResponses,
                    },
                ],
                config: {
                    systemInstruction,
                },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Final response
        |--------------------------------------------------------------------------
        */

        return res.json({
            success: true,
            reply: response.text || "How can I help you?",
            menuResults: menuResults.map((food) => ({
                id: food._id.toString(),
                name: food.name,
                description: food.description,
                price: food.price,
                category: food.category,
                imageUrl: food.imageUrl,
            })),
            addedItem,
            checkoutReady: Boolean(addedItem),
        });
    } catch (error) {
        console.error("Gemini chatbot error:", error);

        return res.status(500).json({
            success: false,
            message: "Sorry, the AI chatbot encountered an error.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

module.exports = router;