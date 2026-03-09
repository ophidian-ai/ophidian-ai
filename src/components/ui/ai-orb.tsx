"use client"

import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send } from "lucide-react"
import { SiriOrb } from "@/components/ui/siri-orb"

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
              <SiriOrb size="24px" animationDuration={15} />
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
        className="group relative flex h-14 w-14 items-center justify-center rounded-full overflow-hidden shadow-glow hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all duration-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <div className="flex h-full w-full items-center justify-center border border-primary/20 bg-surface/80 backdrop-blur-xl rounded-full">
            <X className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <SiriOrb
            size="56px"
            animationDuration={15}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </button>
    </div>
  )
}

export default AIChatWidget
