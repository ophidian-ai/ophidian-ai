"use client";

/**
 * Visual mockup of the Iris AI chatbot in action.
 * Used on the homepage ProductShowcase and AI Chatbot service page.
 */
export function ChatbotMockup() {
  const messages = [
    { role: "assistant", text: "Hi! I'm Iris, your AI assistant. How can I help you today?" },
    { role: "user", text: "What are your hours this weekend?" },
    {
      role: "assistant",
      text: "We're open Saturday 8am\u20136pm and Sunday 10am\u20134pm. Would you like to place an order for pickup?",
    },
    { role: "user", text: "Yes! Do you have sourdough loaves?" },
    {
      role: "assistant",
      text: "We sure do! Our fresh sourdough is $8.50 per loaf. I can reserve one for you \u2014 what time works for pickup?",
    },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto"
      style={{
        background: "var(--color-surface-container)",
        border: "1px solid var(--color-outline-variant)",
        boxShadow: "var(--shadow-ambient)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{
          background: "linear-gradient(135deg, rgba(122,158,126,0.3) 0%, rgba(170,208,173,0.15) 100%)",
          borderBottom: "1px solid var(--color-outline-variant)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          I
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            Iris AI Assistant
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2.5 p-4" style={{ minHeight: 240 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="px-3.5 py-2 text-[13px] leading-relaxed max-w-[80%]"
              style={{
                borderRadius:
                  msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background:
                  msg.role === "user"
                    ? "var(--color-primary)"
                    : "var(--color-surface-container-high)",
                color:
                  msg.role === "user"
                    ? "var(--color-on-primary)"
                    : "var(--color-on-surface)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div
            className="px-3.5 py-2.5 flex gap-1.5 items-center"
            style={{
              borderRadius: "14px 14px 14px 4px",
              background: "var(--color-surface-container-high)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-primary)", animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-primary)", animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-primary)", animationDelay: "300ms" }} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "1px solid var(--color-outline-variant)" }}
      >
        <div
          className="flex-1 px-3.5 py-2 rounded-full text-[13px]"
          style={{
            background: "var(--color-surface-container-low)",
            color: "var(--color-on-surface-variant)",
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          Type a message...
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>

      {/* Branding */}
      <div
        className="text-center py-2 text-[10px]"
        style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
      >
        Powered by OphidianAI
      </div>
    </div>
  );
}
