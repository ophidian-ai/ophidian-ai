import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const { data: configs, error: configsError } = await supabase
    .from("chatbot_configs")
    .select("id")
    .eq("active", true);

  if (configsError) {
    return NextResponse.json({ error: configsError.message }, { status: 500 });
  }

  for (const config of configs ?? []) {
    const { data: conversations } = await supabase
      .from("chatbot_conversations")
      .select("id")
      .eq("config_id", config.id)
      .gte("created_at", `${dateStr}T00:00:00.000Z`)
      .lt("created_at", `${dateStr}T23:59:59.999Z`);

    const conversationIds = (conversations ?? []).map((c) => c.id);
    const conversationCount = conversationIds.length;

    let messageCount = 0;
    if (conversationIds.length > 0) {
      const { count } = await supabase
        .from("chatbot_messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds);
      messageCount = count ?? 0;
    }

    const avgMessagesPerConversation =
      conversationCount > 0 ? messageCount / conversationCount : 0;

    await supabase.from("chatbot_analytics").upsert(
      {
        config_id: config.id,
        date: dateStr,
        conversation_count: conversationCount,
        message_count: messageCount,
        avg_messages_per_conversation: avgMessagesPerConversation,
      },
      { onConflict: "config_id,date" }
    );
  }

  return NextResponse.json({ processed: (configs ?? []).length });
}
