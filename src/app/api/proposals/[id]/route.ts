import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (token) {
    const tokenHash = hashToken(token);
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(
        "id, content, payment_schedule, status, sent_at, approved_at, typed_name, signing_token_expires_at, clients(contact_name, company_name)"
      )
      .eq("id", id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // For sent proposals, validate the token
    if (proposal.status === "sent") {
      const { data: tokenCheck } = await supabase
        .from("proposals")
        .select("id")
        .eq("id", id)
        .eq("signing_token_hash", tokenHash)
        .single();

      if (!tokenCheck) {
        return NextResponse.json({ error: "Invalid link" }, { status: 403 });
      }

      if (isTokenExpired(proposal.signing_token_expires_at)) {
        return NextResponse.json(
          {
            error:
              "This link has expired. Please contact OphidianAI for a new one.",
          },
          { status: 410 }
        );
      }
    }

    // Strip sensitive fields
    const { signing_token_expires_at: _expires, ...safeProposal } = proposal;
    return NextResponse.json(safeProposal);
  }

  // Authenticated path - check if user owns this proposal via Supabase auth
  const { createServerClient } = await import("@supabase/ssr");
  const authSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
      },
    }
  );
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's client IDs
  const { data: clients } = await authSupabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id);
  const clientIds = (clients || []).map((c: { id: string }) => c.id);

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(
      "id, content, payment_schedule, status, sent_at, approved_at, typed_name, clients(contact_name, company_name)"
    )
    .eq("id", id)
    .in("client_id", clientIds)
    .single();

  if (error || !proposal)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(proposal);
}
