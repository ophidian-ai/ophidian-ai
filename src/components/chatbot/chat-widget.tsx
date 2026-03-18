"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { ChatbotTier, LeadCaptureMode } from "@/lib/supabase/chatbot-types";
import { LeadCaptureForm } from "./lead-capture-form";

interface ChatWidgetProps {
  slug: string;
  greeting: string;
  theme: { primaryColor: string; position: string; logoUrl: string | null };
  leadCapture: { enabled: boolean; mode: LeadCaptureMode; trigger_after: number; fields: string[] };
  tier: ChatbotTier;
  showBranding: boolean;
}

export function ChatWidget({ slug, greeting, theme, leadCapture, tier, showBranding }: ChatWidgetProps) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadDismissCount, setLeadDismissCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: `/api/chat/${slug}`,
      body: { sessionId },
    }),
  });

  // Extract text content from AI SDK v6 UIMessage parts
  function getMessageText(m: (typeof messages)[number]): string {
    if (!m.parts) return "";
    return m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  // Greeting shown as a static first message (initialMessages removed in AI SDK v6)
  const allMessages = [
    { id: "greeting", role: "assistant" as const, content: greeting },
    ...messages.map((m) => ({ id: m.id, role: m.role, content: getMessageText(m) })),
  ];

  const isStreaming = status === "streaming" || status === "submitted";

  // Auto-scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Message-count lead capture
  useEffect(() => {
    if (!leadCapture.enabled || leadCapture.mode !== "message_count" || leadCaptured || leadDismissCount >= 2) return;
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const threshold = leadCapture.trigger_after + leadDismissCount * leadCapture.trigger_after;
    if (userMessageCount >= threshold && !showLeadForm) {
      setShowLeadForm(true);
    }
  }, [messages, leadCapture, leadCaptured, leadDismissCount, showLeadForm]);

  // Intent-based lead capture
  useEffect(() => {
    if (!leadCapture.enabled || leadCapture.mode !== "intent" || leadCaptured) return;
    const lastAssistant = [...allMessages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant?.content?.includes("[LEAD_CAPTURE_SIGNAL]") && !showLeadForm) {
      setShowLeadForm(true);
    }
  }, [allMessages, leadCapture, leadCaptured, showLeadForm]);

  // PostMessage resize
  useEffect(() => {
    window.parent.postMessage({ type: "ophidian-resize", height: document.body.scrollHeight }, "*");
  }, [messages]);

  const handleLeadSubmit = async (formData: Record<string, string>) => {
    try {
      await fetch(`/api/chat/${slug}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: sessionId, ...formData }),
      });
    } catch {
      // silently fail
    }
    setLeadCaptured(true);
    setShowLeadForm(false);
  };

  const handleLeadDismiss = () => {
    setShowLeadForm(false);
    setLeadDismissCount((c) => c + 1);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInputValue("");
  };

  const stripSignal = (content: string) => content.replace(/\[LEAD_CAPTURE_SIGNAL\]/g, "").trim();

  const showTypingIndicator = isStreaming && allMessages.length > 1 && allMessages[allMessages.length - 1].role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "14px",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: theme.primaryColor,
          color: "#ffffff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        {theme.logoUrl && (
          <img
            src={theme.logoUrl}
            alt="Logo"
            style={{ height: "28px", width: "auto", objectFit: "contain" }}
          />
        )}
        <span style={{ fontWeight: 600, fontSize: "15px" }}>Chat with us</span>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
        }}
      >
        {allMessages.map((message) => {
          const displayContent = stripSignal(message.content);
          if (!displayContent) return null;
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  backgroundColor: isUser ? theme.primaryColor : "#f0f0f0",
                  color: isUser ? "#ffffff" : "#1a1a1a",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                }}
              >
                {displayContent}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {showTypingIndicator && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: "16px 16px 16px 4px",
                backgroundColor: "#f0f0f0",
                color: "#666666",
                fontStyle: "italic",
              }}
            >
              Typing...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", color: "#cc0000", fontSize: "13px", padding: "4px 0" }}>
            Something went wrong. Please try again.
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Lead capture form overlay */}
        {showLeadForm && (
          <div style={{ position: "relative" }}>
            <LeadCaptureForm
              fields={leadCapture.fields}
              mode={leadCapture.mode}
              onSubmit={handleLeadSubmit}
              onDismiss={leadCapture.mode === "message_count" ? handleLeadDismiss : undefined}
              primaryColor={theme.primaryColor}
            />
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          borderTop: "1px solid #e5e5e5",
          flexShrink: 0,
          backgroundColor: "#ffffff",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={isStreaming || showLeadForm}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d1d1",
            fontSize: "14px",
            outline: "none",
            backgroundColor: isStreaming || showLeadForm ? "#f5f5f5" : "#ffffff",
            color: "#1a1a1a",
            cursor: isStreaming || showLeadForm ? "not-allowed" : "text",
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || showLeadForm || !inputValue.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isStreaming || showLeadForm || !inputValue.trim() ? "#cccccc" : theme.primaryColor,
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: isStreaming || showLeadForm || !inputValue.trim() ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </form>

      {/* Branding footer */}
      {showBranding && (
        <div
          style={{
            textAlign: "center",
            padding: "6px 16px 10px",
            fontSize: "11px",
            color: "#999999",
            flexShrink: 0,
          }}
        >
          Powered by{" "}
          <a
            href="https://ophidianai.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#999999", textDecoration: "underline" }}
          >
            OphidianAI
          </a>
        </div>
      )}
    </div>
  );
}
