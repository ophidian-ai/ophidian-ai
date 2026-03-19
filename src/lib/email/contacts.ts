import { createClient } from "@/lib/supabase/server";
import type { EmailContact } from "@/lib/supabase/email-types";

export async function createContact(
  clientId: string,
  data: { email: string; name?: string; phone?: string; tags?: string[]; source: string }
): Promise<EmailContact> {
  const supabase = await createClient();

  // Get max_contacts for this client
  const { data: configData, error: configError } = await supabase
    .from("email_configs")
    .select("max_contacts")
    .eq("client_id", clientId)
    .eq("active", true)
    .single();

  if (configError || !configData) {
    throw new Error("Email config not found for client");
  }

  // Count existing contacts
  const { count, error: countError } = await supabase
    .from("email_contacts")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (countError) {
    throw new Error(`Failed to count contacts: ${countError.message}`);
  }

  if ((count ?? 0) >= configData.max_contacts) {
    throw new Error("Contact limit reached for this account");
  }

  // Upsert contact
  const { data: contact, error: upsertError } = await supabase
    .from("email_contacts")
    .upsert(
      {
        client_id: clientId,
        email: data.email,
        name: data.name ?? null,
        phone: data.phone ?? null,
        tags: data.tags ?? [],
        source: data.source,
      },
      { onConflict: "client_id,email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (upsertError || !contact) {
    throw new Error(`Failed to upsert contact: ${upsertError?.message}`);
  }

  return contact as EmailContact;
}

export async function createContactsBatch(
  clientId: string,
  contacts: Array<{ email: string; name?: string; phone?: string; tags?: string[]; source: string }>
): Promise<EmailContact[]> {
  if (contacts.length > 100) {
    throw new Error("Batch size cannot exceed 100 contacts");
  }

  const supabase = await createClient();

  // Get max_contacts for this client
  const { data: configData, error: configError } = await supabase
    .from("email_configs")
    .select("max_contacts")
    .eq("client_id", clientId)
    .eq("active", true)
    .single();

  if (configError || !configData) {
    throw new Error("Email config not found for client");
  }

  // Count existing contacts
  const { count, error: countError } = await supabase
    .from("email_contacts")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (countError) {
    throw new Error(`Failed to count contacts: ${countError.message}`);
  }

  if ((count ?? 0) + contacts.length > configData.max_contacts) {
    throw new Error("Batch would exceed contact limit for this account");
  }

  const rows = contacts.map((c) => ({
    client_id: clientId,
    email: c.email,
    name: c.name ?? null,
    phone: c.phone ?? null,
    tags: c.tags ?? [],
    source: c.source,
  }));

  const { data: upserted, error: upsertError } = await supabase
    .from("email_contacts")
    .upsert(rows, { onConflict: "client_id,email", ignoreDuplicates: false })
    .select();

  if (upsertError || !upserted) {
    throw new Error(`Failed to upsert contacts: ${upsertError?.message}`);
  }

  return upserted as EmailContact[];
}

export async function unsubscribeContact(contactId: string): Promise<void> {
  const supabase = await createClient();

  const { error: contactError } = await supabase
    .from("email_contacts")
    .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
    .eq("id", contactId);

  if (contactError) {
    throw new Error(`Failed to unsubscribe contact: ${contactError.message}`);
  }

  const { error: enrollmentError } = await supabase
    .from("email_sequence_enrollments")
    .update({ status: "unsubscribed" })
    .eq("contact_id", contactId)
    .eq("status", "active");

  if (enrollmentError) {
    throw new Error(`Failed to update enrollments: ${enrollmentError.message}`);
  }
}

export async function getContactsBySegment(
  configId: string,
  filter: { tags?: string[]; engagement_min?: number; last_engaged_after?: string }
): Promise<{ count: number; contacts: EmailContact[] }> {
  const supabase = await createClient();

  // Get client_id from config
  const { data: configData, error: configError } = await supabase
    .from("email_configs")
    .select("client_id")
    .eq("id", configId)
    .single();

  if (configError || !configData) {
    throw new Error("Email config not found");
  }

  const { client_id } = configData;

  let query = supabase
    .from("email_contacts")
    .select("*")
    .eq("client_id", client_id)
    .eq("subscribed", true);

  if (filter.tags && filter.tags.length > 0) {
    query = query.overlaps("tags", filter.tags);
  }

  if (filter.engagement_min !== undefined) {
    query = query.gte("engagement_score", filter.engagement_min);
  }

  if (filter.last_engaged_after) {
    query = query.gte("last_engaged_at", filter.last_engaged_after);
  }

  const { data, error, count } = await query.select("*", { count: "exact" });

  if (error) {
    throw new Error(`Failed to query contacts: ${error.message}`);
  }

  return {
    count: count ?? 0,
    contacts: (data ?? []) as EmailContact[],
  };
}
