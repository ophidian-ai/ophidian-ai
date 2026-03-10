import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProjectPhase } from "@/lib/supabase/types";

const VALID_PHASES: ProjectPhase[] = [
  "discovery",
  "design",
  "development",
  "review",
  "live",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { phase } = body as { phase: ProjectPhase };

  if (!phase || !VALID_PHASES.includes(phase)) {
    return NextResponse.json(
      { error: `Invalid phase. Must be one of: ${VALID_PHASES.join(", ")}` },
      { status: 400 }
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update({
      phase,
      phase_updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project });
}
