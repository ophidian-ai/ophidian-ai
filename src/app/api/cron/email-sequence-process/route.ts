import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processSequenceStep } from "@/lib/email/sequences";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find active enrollments where next_send_at is due
  const { data: enrollments, error } = await supabase
    .from("email_sequence_enrollments")
    .select("id")
    .eq("status", "active")
    .lte("next_send_at", new Date().toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const results = await Promise.allSettled(
    enrollments.map((e) => processSequenceStep(e.id))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    processed: enrollments.length,
    succeeded,
    failed,
  });
}
