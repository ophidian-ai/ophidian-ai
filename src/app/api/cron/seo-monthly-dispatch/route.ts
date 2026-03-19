import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: configs, error } = await supabase
    .from("seo_configs")
    .select("id, website_url, clients(company_name)")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ophidianai.com";

  const results = await Promise.allSettled(
    (configs ?? []).map((config) =>
      fetch(`${baseUrl}/api/admin/seo/configs/${config.id}/run`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.CRON_SECRET,
        },
      })
    )
  );

  const count = results.length;
  const clientNames = (configs ?? []).map(
    (c: any) => {
      const client = c.clients;
      if (Array.isArray(client) && client[0]?.company_name) return client[0].company_name;
      if (client?.company_name) return client.company_name;
      return c.website_url;
    }
  );

  await resend.emails.send({
    from: "Iris <iris@ophidianai.com>",
    to: "eric.lefler@ophidianai.com",
    subject: `SEO Monthly Audit: Dispatched ${count} audits`,
    text: [
      `Dispatched ${count} monthly SEO audit(s).`,
      "",
      "Clients:",
      ...clientNames.map((name) => `- ${name}`),
    ].join("\n"),
  });

  return NextResponse.json({ dispatched: count, clients: clientNames });
}
