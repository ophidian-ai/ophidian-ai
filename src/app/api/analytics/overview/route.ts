import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientOverview } from "@/lib/analytics/overview";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve client record from profile
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const overview = await getClientOverview(client.id);

  if (overview.productsActive === 0) {
    return NextResponse.json(
      { error: "No active products found", overview },
      { status: 404 }
    );
  }

  return NextResponse.json({ overview });
}
