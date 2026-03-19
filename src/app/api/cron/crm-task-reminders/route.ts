import { NextRequest, NextResponse } from "next/server";
import { sendTaskReminders } from "@/lib/crm/tasks";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await sendTaskReminders();
    return NextResponse.json({ sent: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/crm-task-reminders]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
