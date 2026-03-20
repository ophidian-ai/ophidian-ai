import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Placeholder -- monthly ad report generation to be implemented
  // Will aggregate metrics per client config, generate PDF summaries,
  // and store in reports table or send via email.

  return NextResponse.json({
    success: true,
    message: "Ad monthly report cron triggered",
    triggered_at: new Date().toISOString(),
  });
}
