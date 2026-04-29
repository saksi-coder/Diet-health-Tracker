import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/aiApi";
import { useAuth } from "../context/AuthContext";
import "./Chatbot.css";

const quickActions = [
  "What's my BMI?",
  "How many calories today?",
  "Water intake",
  "Exercise status",
  "My weight",
  "Diet plan",
  "How to log?",
  "My goal",
];

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { type: "user", text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(msg);
      const botMsg = { type: "bot", text: data.reply, time: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg = {
        type: "bot",
        text: "Something went wrong. Please try again.",
        time: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💬 Health Assistant</h1>
        <p>Ask me anything about your health data</p>
      </div>

      <div className="chatbot-container glass-card">
        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">🤖</div>
              <h3>Hey {user?.name ? user.name.split(" ")[0] : ""}! I'm your wellness assistant</h3>
              <p>
                Ask me about your calories, water intake, BMI, exercise, weight,
                or diet plan. I use your real-time health data to respond!
              </p>
              <div className="chat-quick-actions">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    className="quick-action-btn"
                    onClick={() => sendMessage(action)}
                    id={`quick-${action.replace(/[^a-zA-Z]/g, "-").toLowerCase()}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.type}`}>
              <div className="chat-avatar">
                {msg.type === "bot" ? "🤖" : "👤"}
              </div>
              <div>
                <div className="chat-bubble">{msg.text}</div>
                <div className="chat-timestamp">{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message bot">
              <div className="chat-avatar">🤖</div>
              <div className="chat-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions shown after messages exist */}
        {messages.length > 0 && !loading && (
          <div style={{ padding: "0 var(--spacing-lg)" }}>
            <div className="chat-quick-actions">
              {quickActions.slice(0, 4).map((action) => (
                <button
                  key={action}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="chat-input"
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            id="chat-send-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
