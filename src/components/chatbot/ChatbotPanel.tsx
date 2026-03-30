"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { X, Send } from "lucide-react";

interface ContextPill {
  label: string;
  message: string;
}

interface ChatbotPanelProps {
  /**
   * Page-specific context pills surfaced in the panel header.
   * Clicking a pill sends a pre-written message to Iris.
   */
  contextPills?: ContextPill[];
}

const DEFAULT_PILLS: ContextPill[] = [
  { label: "About this work", message: "Tell me about OphidianAI's work and approach." },
  { label: "Get in touch", message: "I'd like to get in touch about a project." },
  { label: "Pricing", message: "What does it cost to work with OphidianAI?" },
];

export function ChatbotPanel({ contextPills = DEFAULT_PILLS }: ChatbotPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/ophidianai-demo",
        body: { sessionId },
      }),
    [sessionId]
  );

  const { messages: chatMessages, sendMessage, status } = useChat({
    id: sessionId,
    transport,
  });

  function getMessageText(m: (typeof chatMessages)[number]): string {
    if (!m.parts) return "";
    return m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  const allMessages = [
    {
      id: "greeting",
      role: "assistant" as const,
      content: "Hi! I'm Iris — OphidianAI's assistant. Ask me anything about the studio or how we might work together.",
    },
    ...chatMessages.map((m) => ({ id: m.id, role: m.role, content: getMessageText(m) })),
  ];

  const isStreaming = status === "streaming" || status === "submitted";

  // Listen for global open-chat event (dispatched from Nav + StatementFooter)
  useEffect(() => {
    function onOpen() {
      setIsOpen(true);
    }
    window.addEventListener("ophidian:open-chat", onOpen);
    return () => window.removeEventListener("ophidian:open-chat", onOpen);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handlePill = (pill: ContextPill) => {
    if (isStreaming) return;
    sendMessage({ text: pill.message });
  };

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Contact panel"
          aria-modal="true"
          style={{
            position: "fixed",
            // Mobile: full bottom sheet
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--color-cream)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "85svh",
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            animation: "slide-up var(--duration-slow) var(--ease-out) forwards",
          }}
          className="chatbot-panel"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px 12px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Avatar placeholder — Eric's photo will go here */}
              <div
                aria-hidden="true"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "9999px",
                  background:
                    "radial-gradient(circle at 40% 40%, var(--color-sage) 0%, var(--color-taupe) 100%)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-forest)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Eric
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--color-taupe)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  OphidianAI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close contact panel"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-taupe)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                transition: "color var(--duration-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-forest)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-taupe)";
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Context pills */}
          {contextPills.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                padding: "12px 20px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {contextPills.map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => handlePill(pill)}
                  style={{
                    background: "rgba(170, 172, 154, 0.18)",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "8px 16px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-forest)",
                    cursor: "pointer",
                    transition: "background var(--duration-fast), color var(--duration-fast)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(194, 151, 127, 0.15)";
                    el.style.color = "var(--color-terracotta)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(170, 172, 154, 0.18)";
                    el.style.color = "var(--color-forest)";
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {allMessages.map((msg) => {
              if (!msg.content) return null;
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isAssistant ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: isAssistant
                        ? "4px 12px 12px 12px"
                        : "12px 4px 12px 12px",
                      background: isAssistant
                        ? "var(--color-surface)"
                        : "var(--color-terracotta)",
                      color: isAssistant ? "var(--color-text-body)" : "var(--color-cream)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {isStreaming &&
              allMessages[allMessages.length - 1]?.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "4px 12px 12px 12px",
                      background: "var(--color-surface)",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "14px",
                    }}
                  >
                    Typing…
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "12px 20px",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                aria-label="Chat message input"
                style={{
                  flex: 1,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  color: "var(--color-forest)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-sage)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-border)";
                }}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                aria-label="Send message"
                style={{
                  width: "36px",
                  height: "36px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-terracotta)",
                  color: "var(--color-cream)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  opacity: isStreaming || !input.trim() ? 0.45 : 1,
                  transition: "opacity var(--duration-fast)",
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trigger pill — bottom-left, always visible */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "var(--color-dark)",
            color: "var(--color-cream)",
            border: "none",
            borderRadius: "9999px",
            padding: "12px 20px",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "var(--shadow-md)",
            transition:
              "background var(--duration-fast), box-shadow var(--duration-fast), transform var(--duration-fast)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "#4A4A44";
            el.style.boxShadow = "var(--shadow-lg)";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "var(--color-dark)";
            el.style.boxShadow = "var(--shadow-md)";
            el.style.transform = "translateY(0)";
          }}
        >
          {/* Avatar placeholder — Eric's photo (32px circular) */}
          <div
            aria-hidden="true"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9999px",
              background:
                "radial-gradient(circle at 40% 40%, var(--color-sage) 0%, var(--color-taupe) 100%)",
              flexShrink: 0,
            }}
          />
          <span>Let&apos;s work together</span>
        </button>
      )}

      {/* Desktop panel override */}
      <style>{`
        @media (min-width: 768px) {
          .chatbot-panel {
            bottom: 24px !important;
            left: 24px !important;
            right: auto !important;
            width: 384px !important;
            border-radius: var(--radius-xl) !important;
            max-height: 580px !important;
            animation: desktop-panel-in var(--duration-slow) var(--ease-out) forwards !important;
          }
        }
        @keyframes desktop-panel-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
