import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://esm.sh/jose@5";

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const privateKey = await importPKCS8(
    serviceAccount.private_key,
    "RS256"
  );

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function isSunday(): boolean {
  return new Date().getDay() === 0;
}

async function fetchSearchAnalytics(
  siteUrl: string,
  date: string,
  accessToken: string
): Promise<{
  top_queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  total_clicks: number;
  total_impressions: number;
  avg_ctr: number;
  avg_position: number;
}> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: date,
        endDate: date,
        dimensions: ["query"],
        rowLimit: 25,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Search Console request failed: ${err}`);
  }

  const data: SearchAnalyticsResponse = await res.json();
  const rows = data.rows ?? [];

  const top_queries = rows.map((row) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  const total_clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const total_impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const avg_ctr =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + r.ctr, 0) / rows.length
      : 0;
  const avg_position =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + r.position, 0) / rows.length
      : 0;

  return { top_queries, total_clicks, total_impressions, avg_ctr, avg_position };
}

async function fetchIndexedPages(
  siteUrl: string,
  accessToken: string
): Promise<number | null> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const sitemaps = data.sitemap ?? [];

  let totalIndexed = 0;
  for (const sitemap of sitemaps) {
    for (const content of sitemap.contents ?? []) {
      totalIndexed += content.indexed ?? 0;
    }
  }

  return totalIndexed > 0 ? totalIndexed : null;
}

serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const targetClientId = (body as { clientId?: string }).clientId;

    const serviceAccount = JSON.parse(
      Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!
    );
    const accessToken = await getAccessToken(serviceAccount);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase
      .from("clients")
      .select("id, search_console_url")
      .not("search_console_url", "is", null);

    if (targetClientId) {
      query = query.eq("id", targetClientId);
    }

    const { data: clients, error: clientsError } = await query;

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    const date = getYesterday();
    const sunday = isSunday();
    const results: Array<{ clientId: string; status: string }> = [];

    for (const client of clients ?? []) {
      try {
        const analytics = await fetchSearchAnalytics(
          client.search_console_url,
          date,
          accessToken
        );

        let indexed_pages: number | null = null;

        if (sunday) {
          // On Sundays, fetch fresh indexed page count from sitemaps API
          indexed_pages = await fetchIndexedPages(
            client.search_console_url,
            accessToken
          );
        } else {
          // On other days, carry forward the last known value
          const { data: lastRecord } = await supabase
            .from("client_seo_metrics")
            .select("indexed_pages")
            .eq("client_id", client.id)
            .not("indexed_pages", "is", null)
            .order("date", { ascending: false })
            .limit(1)
            .maybeSingle();

          indexed_pages = lastRecord?.indexed_pages ?? null;
        }

        const { error: upsertError } = await supabase
          .from("client_seo_metrics")
          .upsert(
            {
              client_id: client.id,
              date,
              total_clicks: analytics.total_clicks,
              total_impressions: analytics.total_impressions,
              avg_ctr: analytics.avg_ctr,
              avg_position: analytics.avg_position,
              top_queries: analytics.top_queries,
              indexed_pages,
            },
            { onConflict: "client_id,date" }
          );

        if (upsertError) {
          throw upsertError;
        }

        results.push({ clientId: client.id, status: "ok" });
      } catch (err) {
        results.push({
          clientId: client.id,
          status: `error: ${(err as Error).message}`,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date,
        synced: results.filter((r) => r.status === "ok").length,
        failed: results.filter((r) => r.status !== "ok").length,
        results,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
