import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRevenueBreakdown } from "@/lib/analytics/overview";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403 } as const;

  return { ok: true } as const;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const revenue = await getRevenueBreakdown();

  return NextResponse.json(revenue);
}
