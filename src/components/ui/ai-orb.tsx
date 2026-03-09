"use client"

import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send } from "lucide-react"

interface AIOrbProps {
  size?: string
  className?: string
  animationDuration?: number
}

const AIOrb: React.FC<AIOrbProps> = ({
  size = "48px",
  className,
  animationDuration = 20,
}) => {
  const sizeValue = parseInt(size.replace("px", ""), 10)
  const blurAmount = Math.max(sizeValue * 0.08, 4)
  const contrastAmount = Math.max(sizeValue * 0.003, 1.8)

  return (
    <div
      className={cn("ai-orb", className)}
      style={
        {
          width: size,
          height: size,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .ai-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(
            circle,
            rgba(57, 255, 20, 0.08) 0%,
            rgba(13, 177, 178, 0.04) 30%,
            transparent 70%
          );
        }

        .ai-orb::before {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background:
            conic-gradient(
              from calc(var(--angle) * 1.2) at 30% 65%,
              #0DB1B2 0deg,
              transparent 45deg 315deg,
              #0DB1B2 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 0.8) at 70% 35%,
              #39FF14 0deg,
              transparent 60deg 300deg,
              #39FF14 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -1.5) at 65% 75%,
              #5FFF42 0deg,
              transparent 90deg 270deg,
              #5FFF42 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 2.1) at 25% 25%,
              #0DB1B2 0deg,
              transparent 30deg 330deg,
              #0DB1B2 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -0.7) at 80% 80%,
              #39FF14 0deg,
              transparent 45deg 315deg,
              #39FF14 360deg
            ),
            radial-gradient(
              ellipse 120% 80% at 40% 60%,
              #2BCC10 0%,
              transparent 50%
            );
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(1.2);
          animation: ai-orb-rotate var(--animation-duration) linear infinite;
          transform: translateZ(0);
          will-change: transform;
        }

        .ai-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 45% 55%,
            rgba(57, 255, 20, 0.15) 0%,
            rgba(13, 177, 178, 0.08) 30%,
            transparent 60%
          );
          mix-blend-mode: overlay;
        }

        @keyframes ai-orb-rotate {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm the OphidianAI assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    // Simulated response -- replace with actual API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Thanks for reaching out! Our team will get back to you shortly. In the meantime, feel free to explore our services or book a discovery call.",
        },
      ])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-xl border border-surface-border bg-surface/95 backdrop-blur-xl shadow-card-hover overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
            <div className="flex items-center gap-2">
              <AIOrb size="24px" animationDuration={15} />
              <span className="font-semibold text-sm text-foreground">
                OphidianAI Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  msg.role === "assistant"
                    ? "bg-primary/10 text-foreground"
                    : "ml-auto bg-primary/20 text-foreground"
                )}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-surface-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating orb trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-surface/80 backdrop-blur-xl shadow-glow hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all duration-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-primary" />
        ) : (
          <>
            <AIOrb
              size="40px"
              animationDuration={15}
              className="absolute inset-0 m-auto opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <MessageSquare className="relative z-10 h-5 w-5 text-primary drop-shadow-[0_0_4px_rgba(57,255,20,0.5)]" />
          </>
        )}
      </button>
    </div>
  )
}

export { AIOrb }
export default AIChatWidget
