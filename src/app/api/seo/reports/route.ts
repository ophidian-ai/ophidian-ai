import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: config, error: configError } = await supabase
    .from("seo_configs")
    .select("id")
    .eq("client_id", client.id)
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: "SEO config not found" }, { status: 404 });
  }

  const { data: reports, error: reportsError } = await supabase
    .from("seo_audits")
    .select("id, date, report_url")
    .eq("config_id", config.id)
    .order("date", { ascending: false });

  if (reportsError) {
    return NextResponse.json({ error: reportsError.message }, { status: 500 });
  }

  return NextResponse.json({ reports: reports ?? [] });
}
