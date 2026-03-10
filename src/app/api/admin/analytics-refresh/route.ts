import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403 };

  return { user };
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { clientId } = body as { clientId?: string };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Service role configuration missing" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

  const functionPayload = clientId ? { clientId } : {};

  // Invoke all three edge functions in parallel
  const [ga4Result, searchConsoleResult, overdueResult] = await Promise.all([
    supabase.functions.invoke("sync-ga4-data", {
      body: functionPayload,
    }),
    supabase.functions.invoke("sync-search-console", {
      body: functionPayload,
    }),
    supabase.functions.invoke("check-overdue-payments"),
  ]);

  const results = {
    ga4: ga4Result.error
      ? { success: false, error: ga4Result.error.message }
      : ga4Result.data,
    searchConsole: searchConsoleResult.error
      ? { success: false, error: searchConsoleResult.error.message }
      : searchConsoleResult.data,
    overduePayments: overdueResult.error
      ? { success: false, error: overdueResult.error.message }
      : overdueResult.data,
  };

  const allSucceeded =
    results.ga4?.success !== false &&
    results.searchConsole?.success !== false &&
    results.overduePayments?.success !== false;

  return NextResponse.json(
    { success: allSucceeded, results },
    { status: allSucceeded ? 200 : 207 }
  );
}
