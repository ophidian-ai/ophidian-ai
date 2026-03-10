import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

// POST /api/notifications/create -- Admin-only notification creation
// Body: { user_id, type, title, message, link? }
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role via profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const { user_id, type, title, message, link } = body;

  if (!user_id || !type || !title || !message) {
    return NextResponse.json(
      { error: "Missing required fields: user_id, type, title, message" },
      { status: 400 }
    );
  }

  await createNotification({
    userId: user_id,
    type,
    title,
    message,
    link,
  });

  return NextResponse.json({ success: true });
}
