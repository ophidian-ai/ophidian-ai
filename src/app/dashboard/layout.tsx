import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientModules } from "@/lib/modules";
import type { DashboardModule } from "@/lib/modules";
import { DashboardProvider } from "@/lib/dashboard-context";
import { Sidebar } from "@/components/dashboard/sidebar";
import type { ClientService, ProjectPhase } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "admin" | "client") ?? "client";
  let modulesArray: DashboardModule[] = [];
  let clientId: string | null = null;

  if (role === "client") {
    // Fetch client record
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    clientId = client?.id ?? null;

    if (clientId) {
      // Fetch services
      const { data: services } = await supabase
        .from("client_services")
        .select("*")
        .eq("client_id", clientId);

      // Fetch active project phase (for web design clients)
      const { data: project } = await supabase
        .from("projects")
        .select("phase")
        .eq("client_id", clientId)
        .eq("status", "active")
        .maybeSingle();

      const projectPhase = (project?.phase as ProjectPhase) ?? null;
      const modulesSet = getClientModules(
        (services ?? []) as ClientService[],
        projectPhase
      );
      modulesArray = Array.from(modulesSet);
    }
  }

  return (
    <DashboardProvider role={role} modules={modulesArray} clientId={clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar role={role} modules={modulesArray} />
        <main className="flex-1 ml-64 p-6 md:p-8">{children}</main>
      </div>
    </DashboardProvider>
  );
}
