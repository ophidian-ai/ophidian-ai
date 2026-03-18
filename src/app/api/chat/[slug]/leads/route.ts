import { NextRequest, NextResponse } from "next/server";
import { loadConfig } from "@/lib/chatbot/config";
import { captureLead } from "@/lib/chatbot/lead-capture";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const config = await loadConfig(slug);
    if (!config) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      conversationId,
      name,
      email,
      phone,
      customFields,
    }: {
      conversationId: string;
      name?: string;
      email?: string;
      phone?: string;
      customFields?: Record<string, unknown>;
    } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    if (!name && !email && !phone) {
      return NextResponse.json(
        { error: "At least one of name, email, or phone is required" },
        { status: 400 }
      );
    }

    await captureLead(config, {
      conversationId,
      name,
      email,
      phone,
      customFields,
      sourcePage: request.headers.get("referer") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
