import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RestaurantChatbot.css";

const API_BASE = "http://localhost:5000";

function RestaurantChatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      type: "text",
      text:
        "Hi! 👋 I'm your CraveBite assistant. Tell me what you'd like to eat."
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const addBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: "bot",
        type: "text",
        text
      }
    ]);
  };

  const searchMenu = async (query) => {
    const response = await fetch(
      `${API_BASE}/api/chatbot/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Menu search failed");
    }

    return response.json();
  };

  const addToCartAndCheckout = async (food) => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      addBotMessage(
        "You need to log in before ordering. I'll take you to the login page."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    let user;

    try {
      user = JSON.parse(userString);
    } catch {
      addBotMessage("Please log in again before ordering.");
      navigate("/login");
      return;
    }

    const userId = user?.id;

    if (!userId) {
      addBotMessage("I couldn't identify your account. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: food.name,
          price: food.price,
          quantity: 1,
          userId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Could not add item to cart");
      }

      addBotMessage(
        `Added ${food.name} to your cart. 🛒 Taking you to checkout...`
      );

      setTimeout(() => {
        navigate("/checkout");
      }, 800);

    } catch (error) {
      console.error(error);

      addBotMessage(
        "Sorry, I couldn't add that item to your cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = message.trim();

    if (!query || loading) return;

    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        type: "text",
        text: query
      }
    ]);

    try {
      setLoading(true);

      const data = await searchMenu(query);

      if (!data.success) {
        addBotMessage("Sorry, I couldn't search the menu.");
        return;
      }

      const exactMatches = data.exactMatches || [];
      const relatedMatches = data.relatedMatches || [];

      /*
        EXACT MATCH
      */
      if (exactMatches.length > 0) {
        addBotMessage("I found these items for you:");

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            sender: "bot",
            type: "foods",
            foods: exactMatches
          }
        ]);

        return;
      }

      /*
        NO EXACT MATCH BUT RELATED ITEMS
      */
      if (relatedMatches.length > 0) {
        addBotMessage(
          `I couldn't find "${query}" exactly, but here are some related items from our menu:`
        );

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            sender: "bot",
            type: "foods",
            foods: relatedMatches
          }
        ]);

        return;
      }

      /*
        NOTHING FOUND
      */
      addBotMessage(
        `Sorry, I couldn't find anything related to "${query}" in our current menu. Try asking for something like a burger, pizza, pasta, or biriyani.`
      );

    } catch (error) {
      console.error("Chatbot error:", error);

      addBotMessage(
        "Sorry! I'm having trouble connecting to the menu right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <>
      {/* Floating chatbot button */}
      {!isOpen && (
        <button
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open CraveBite chatbot"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-container">

          <div className="chatbot-header">
            <div>
              <div className="chatbot-title">
                🍽️ CraveBite Assistant
              </div>

              <div className="chatbot-status">
                ● Online
              </div>
            </div>

            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.sender === "user"
                    ? "chat-message user-message"
                    : "chat-message bot-message"
                }
              >
                {msg.type === "text" && (
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                )}

                {msg.type === "foods" && (
                  <div className="food-results">

                    {msg.foods.map((food) => (
                      <div
                        className="chat-food-card"
                        key={food._id}
                      >

                        {food.imageUrl && (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="chat-food-image"
                          />
                        )}

                        <div className="chat-food-info">

                          <h4>{food.name}</h4>

                          <p className="chat-food-description">
                            {food.description}
                          </p>

                          <div className="chat-food-bottom">

                            <strong>
                              ₹{food.price}
                            </strong>

                            <button
                              onClick={() =>
                                addToCartAndCheckout(food)
                              }
                              disabled={loading}
                            >
                              Add & Checkout
                            </button>

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message">
                <div className="message-bubble typing">
                  Searching the menu...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          <div className="chatbot-input-area">

            <input
              type="text"
              value={message}
              placeholder="Ask for a food..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              onClick={handleSearch}
              disabled={loading || !message.trim()}
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