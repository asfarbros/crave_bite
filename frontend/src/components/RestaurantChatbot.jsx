import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RestaurantChatbot.css";
import { API_URL } from "../config";

function RestaurantChatbot() {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Hi! 👋 I'm CraveBite AI. What would you like to eat today?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const getUser = () => {
        try {
            const user = localStorage.getItem("user");

            if (!user) {
                return null;
            }

            return JSON.parse(user);
        } catch {
            return null;
        }
    };

    const sendMessage = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput || loading) {
            return;
        }

        const user = getUser();

        const userMessage = {
            role: "user",
            text: trimmedInput,
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setInput("");
        setLoading(true);

        try {
            const history = messages.map((message) => ({
                role: message.role === "model" ? "model" : "user",
                text: message.text,
            }));

            const response = await fetch(
                `${API_URL}/api/chatbot`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: trimmedInput,
                        userId: user?.id || user?._id || null,
                        history,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Chatbot request failed"
                );
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text: data.reply,
                    menuResults: data.menuResults || [],
                    addedItem: data.addedItem || null,
                    checkoutReady: data.checkoutReady || false,
                },
            ]);
        } catch (error) {
            console.error(error);

            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text:
                        "Sorry 😔 I couldn't connect to the CraveBite AI service. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const addItemToCart = async (food) => {
        const user = getUser();

        if (!user) {
            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text: "Please log in first so I can add the item to your cart.",
                },
            ]);

            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/chatbot`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: `Add ${food.name} to my cart`,
                        userId: user.id || user._id,
                        history: messages.map((message) => ({
                            role:
                                message.role === "model"
                                    ? "model"
                                    : "user",
                            text: message.text,
                        })),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not add item"
                );
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text: `${food.name} has been added to your cart! 🛒`,
                    addedItem: data.addedItem,
                    checkoutReady: true,
                },
            ]);
        } catch (error) {
            console.error(error);

            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text:
                        "I couldn't add that item to your cart. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const goToCheckout = () => {
        navigate("/checkout");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <>
            <button
                className="chatbot-floating-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open CraveBite AI"
            >
                🤖
            </button>

            {isOpen && (
                <div className="restaurant-chatbot">
                    <div className="chatbot-header">
                        <div>
                            <strong>CraveBite AI</strong>
                            <span>Online • Restaurant Assistant</span>
                        </div>

                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chat-message ${
                                    message.role === "user"
                                        ? "user-message"
                                        : "bot-message"
                                }`}
                            >
                                <div className="message-text">
                                    {message.text}
                                </div>

                                {message.menuResults?.length > 0 && (
                                    <div className="chat-food-results">
                                        {message.menuResults.map(
                                            (food) => (
                                                <div
                                                    className="chat-food-card"
                                                    key={food.id}
                                                >
                                                    {food.imageUrl && (
                                                        <img
                                                            src={
                                                                food.imageUrl
                                                            }
                                                            alt={
                                                                food.name
                                                            }
                                                        />
                                                    )}

                                                    <div className="chat-food-info">
                                                        <h4>
                                                            {food.name}
                                                        </h4>

                                                        <p>
                                                            {
                                                                food.description
                                                            }
                                                        </p>

                                                        <strong>
                                                            ₹
                                                            {
                                                                food.price
                                                            }
                                                        </strong>

                                                        <button
                                                            onClick={() =>
                                                                addItemToCart(
                                                                    food
                                                                )
                                                            }
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {message.checkoutReady && (
                                    <button
                                        className="checkout-chat-button"
                                        onClick={goToCheckout}
                                    >
                                        Proceed to Payment →
                                    </button>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-message bot-message">
                                Thinking... 🤔
                            </div>
                        )}
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            placeholder="Ask for food..."
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />

                        <button
                            onClick={sendMessage}
                            disabled={loading}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default RestaurantChatbot;