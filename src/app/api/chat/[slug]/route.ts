import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { loadConfig } from "@/lib/chatbot/config";
import { queryKnowledgeBase } from "@/lib/chatbot/rag";
import { checkSessionRateLimit, checkMonthlyCap } from "@/lib/chatbot/rate-limit";
import { buildSystemPrompt, MODEL_TEMPERATURE } from "@/lib/chatbot/prompt-builder";
import { MAX_MESSAGE_LENGTH, MAX_CONVERSATION_MESSAGES } from "@/lib/chatbot/tier-defaults";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function getCorsHeaders(config: Awaited<ReturnType<typeof loadConfig>>, origin: string | null): Record<string, string> {
  const allowedOrigins: string[] = config?.allowed_origins ?? [];
  let allowOrigin = "";

  if (allowedOrigins.length === 0) {
    allowOrigin = origin ?? "*";
  } else if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else {
    allowOrigin = allowedOrigins[0];
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = await loadConfig(slug);
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(config, origin);

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const config = await loadConfig(slug);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(config, origin);

  // API key auth for direct access
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== config.api_key_hash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }
  }

  let body: { messages?: Array<{ role: string; content: string }>; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders });
  }

  const { messages, sessionId } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400, headers: corsHeaders });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400, headers: corsHeaders });
  }

  // Sanitize user messages
  const sanitizedMessages = messages.map((m) => ({
    ...m,
    content: m.role === "user" ? m.content.replace(/<[^>]*>/g, "") : m.content,
  }));

  const lastUserMessage = sanitizedMessages.filter((m) => m.role === "user").pop()?.content ?? "";

  if (lastUserMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400, headers: corsHeaders }
    );
  }

  if (sanitizedMessages.length > MAX_CONVERSATION_MESSAGES) {
    return NextResponse.json(
      { error: `Conversation exceeds maximum of ${MAX_CONVERSATION_MESSAGES} messages` },
      { status: 400, headers: corsHeaders }
    );
  }

  const sessionAllowed = await checkSessionRateLimit(sessionId);
  if (!sessionAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: corsHeaders });
  }

  if (messages.length === 1) {
    const capAllowed = await checkMonthlyCap(config);
    if (!capAllowed) {
      return NextResponse.json({ error: "Monthly message cap reached" }, { status: 429, headers: corsHeaders });
    }
  }

  const ragChunks = await queryKnowledgeBase(lastUserMessage, config);
  const systemPrompt = buildSystemPrompt(config, ragChunks);

  const modelMessages = await convertToModelMessages(
    sanitizedMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      parts: [{ type: "text" as const, text: m.content }],
    }))
  );

  const result = streamText({
    model: config.model as any,
    system: systemPrompt,
    messages: modelMessages,
    temperature: MODEL_TEMPERATURE,
    onFinish: async ({ text }) => {
      const supabase = await createClient();

      const { data: conversation } = await supabase
        .from("chatbot_conversations")
        .upsert(
          {
            config_id: config.id,
            session_id: sessionId,
            message_count: sanitizedMessages.length + 1,
            page_url: request.headers.get("referer") || null,
          },
          { onConflict: "config_id,session_id", ignoreDuplicates: false }
        )
        .select("id")
        .single();

      if (conversation) {
        await supabase.from("chatbot_messages").insert([
          { conversation_id: conversation.id, role: "user", content: lastUserMessage },
          {
            conversation_id: conversation.id,
            role: "assistant",
            content: text,
            metadata: text.includes("[LEAD_CAPTURE_SIGNAL]") ? { lead_capture_signal: true } : null,
          },
        ]);
      }
    },
  });

  const response = result.toUIMessageStreamResponse();

  // Apply CORS headers to the streaming response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
