"use client"

import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, Component, type ReactNode } from "react"
import { X, Send } from "lucide-react"
import dynamic from "next/dynamic"

// Lazy-load Three.js glass orb (saves ~183KB from initial bundle)
const GlassOrb3D = dynamic(
  () => import("@/components/ui/glass-orb-3d").then((m) => m.GlassOrb3D),
  {
    ssr: false,
    loading: () => <OrbFallback />,
  }
)

// CSS-only fallback orb (shown while Three.js loads or on WebGL failure)
function OrbFallback({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <div
      className={cn("rounded-full bg-gradient-to-br from-primary/40 to-accent/30 backdrop-blur-sm border border-primary/20 animate-pulse", className)}
    />
  )
}

// Error boundary for WebGL crashes
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallbackClassName?: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallbackClassName?: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <OrbFallback className={this.props.fallbackClassName} />
    }
    return this.props.children
  }
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
      content: "Hi! I'm Iris, your OphidianAI assistant. How can I help you today?",
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
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-xl border border-primary/15 bg-surface/60 backdrop-blur-2xl shadow-[0_0_30px_rgba(13,177,178,0.1),0_0_60px_rgba(57,255,20,0.05)] overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <WebGLErrorBoundary fallbackClassName="h-6 w-6"><GlassOrb3D size="24px" /></WebGLErrorBoundary>
              <span className="font-semibold text-sm text-foreground">
                Iris
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-foreground-muted hover:text-foreground transition-colors"
              aria-label="Close chat"
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
          <div className="border-t border-primary/10 p-3">
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
                className="flex-1 rounded-lg border border-primary/10 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating orb trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full overflow-hidden shadow-glow hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all duration-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <div className="flex h-full w-full items-center justify-center border border-primary/20 bg-surface/80 backdrop-blur-xl rounded-full">
            <X className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <WebGLErrorBoundary>
            <GlassOrb3D
              size="56px"
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </WebGLErrorBoundary>
        )}
      </button>
    </div>
  )
}

export default AIChatWidget
