import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://esm.sh/jose@5";

interface GA4Row {
  dimensionValues?: Array<{ value: string }>;
  metricValues?: Array<{ value: string }>;
}

interface GA4Response {
  rows?: GA4Row[];
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
    scope: "https://www.googleapis.com/auth/analytics.readonly",
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

async function fetchAggregateMetrics(
  propertyId: string,
  date: string,
  accessToken: string
): Promise<{
  page_views: number;
  visitors: number;
  bounce_rate: number;
  avg_session_duration: number;
}> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: date, endDate: date }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 aggregate request failed: ${err}`);
  }

  const data: GA4Response = await res.json();
  const row = data.rows?.[0];

  return {
    page_views: parseInt(row?.metricValues?.[0]?.value ?? "0", 10),
    visitors: parseInt(row?.metricValues?.[1]?.value ?? "0", 10),
    bounce_rate: parseFloat(row?.metricValues?.[2]?.value ?? "0"),
    avg_session_duration: parseFloat(row?.metricValues?.[3]?.value ?? "0"),
  };
}

async function fetchDimensions(
  propertyId: string,
  date: string,
  accessToken: string
): Promise<{
  top_pages: Array<{ path: string; views: number }>;
  referral_sources: Array<{ source: string; sessions: number }>;
}> {
  const [pagesRes, sourcesRes] = await Promise.all([
    fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: date, endDate: date }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          limit: 10,
          orderBys: [
            { metric: { metricName: "screenPageViews" }, desc: true },
          ],
        }),
      }
    ),
    fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: date, endDate: date }],
          dimensions: [{ name: "sessionSource" }],
          metrics: [{ name: "sessions" }],
          limit: 10,
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),
      }
    ),
  ]);

  if (!pagesRes.ok || !sourcesRes.ok) {
    throw new Error("GA4 dimension request failed");
  }

  const pagesData: GA4Response = await pagesRes.json();
  const sourcesData: GA4Response = await sourcesRes.json();

  const top_pages = (pagesData.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
  }));

  const referral_sources = (sourcesData.rows ?? []).map((row) => ({
    source: row.dimensionValues?.[0]?.value ?? "",
    sessions: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
  }));

  return { top_pages, referral_sources };
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
      .select("id, ga4_property_id")
      .not("ga4_property_id", "is", null);

    if (targetClientId) {
      query = query.eq("id", targetClientId);
    }

    const { data: clients, error: clientsError } = await query;

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    const date = getYesterday();
    const results: Array<{ clientId: string; status: string }> = [];

    for (const client of clients ?? []) {
      try {
        const [metrics, dimensions] = await Promise.all([
          fetchAggregateMetrics(client.ga4_property_id, date, accessToken),
          fetchDimensions(client.ga4_property_id, date, accessToken),
        ]);

        const { error: upsertError } = await supabase
          .from("client_analytics")
          .upsert(
            {
              client_id: client.id,
              date,
              page_views: metrics.page_views,
              visitors: metrics.visitors,
              bounce_rate: metrics.bounce_rate,
              avg_session_duration: metrics.avg_session_duration,
              top_pages: dimensions.top_pages,
              referral_sources: dimensions.referral_sources,
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
