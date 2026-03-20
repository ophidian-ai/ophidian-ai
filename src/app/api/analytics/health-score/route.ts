import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeHealthScore } from "@/lib/analytics/overview";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const health = await computeHealthScore(client.id);

  return NextResponse.json({ ...health });
}
