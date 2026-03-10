import { createClient as createServiceClient } from "@supabase/supabase-js";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

// Use service role to bypass RLS when creating notifications from API routes
export async function createNotification(params: CreateNotificationParams) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase service config for notifications");
    return;
  }

  const supabase = createServiceClient(supabaseUrl, serviceKey);

  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}

// Helper to notify all admins
export async function notifyAdmins(
  params: Omit<CreateNotificationParams, "userId">
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return;

  const supabase = createServiceClient(supabaseUrl, serviceKey);

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return;

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
  }));

  await supabase.from("notifications").insert(notifications);
}
