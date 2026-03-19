import { NextRequest, NextResponse } from "next/server";
import { processAutomationActions } from "@/lib/crm/automations";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await processAutomationActions();
    return NextResponse.json({ processed: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/crm-automation-process]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
