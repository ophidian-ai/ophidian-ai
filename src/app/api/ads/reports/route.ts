import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return NextResponse.json({ error: "Use admin endpoints" }, { status: 403 });
  }

  // Placeholder -- monthly report generation to be implemented
  return NextResponse.json({
    reports: [],
    message: "Monthly ad reports will appear here once generated.",
  });
}
