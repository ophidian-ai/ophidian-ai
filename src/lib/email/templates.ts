import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { EmailTemplate, EmailContact, EmailConfig } from "@/lib/supabase/email-types";

export function renderTemplate(
  template: EmailTemplate,
  contact: EmailContact,
  config: EmailConfig
): { subject: string; html: string } {
  const name = contact.name || "there";

  // Generate unsubscribe HMAC token
  const token = crypto
    .createHmac("sha256", config.unsubscribe_secret)
    .update(contact.id)
    .digest("hex");

  const unsubscribeUrl = `https://ophidianai.com/api/email/${encodeURIComponent(config.sending_domain)}/unsubscribe?contact=${contact.id}&token=${token}`;

  const brand = config.brand_config;

  // Apply variable replacements to subject
  let subject = template.subject_template
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{email\}\}/g, contact.email)
    .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

  if (brand.logoUrl !== undefined) {
    subject = subject.replace(/\{\{logo_url\}\}/g, brand.logoUrl ?? "");
  }
  if (brand.primaryColor !== undefined) {
    subject = subject.replace(/\{\{primary_color\}\}/g, brand.primaryColor ?? "");
  }
  if (brand.footerText !== undefined) {
    subject = subject.replace(/\{\{footer_text\}\}/g, brand.footerText ?? "");
  }
  if (brand.address !== undefined) {
    subject = subject.replace(/\{\{address\}\}/g, brand.address ?? "");
  }

  // Apply variable replacements to HTML body
  let html = template.html_template
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{email\}\}/g, contact.email)
    .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
    .replace(/\{\{logo_url\}\}/g, brand.logoUrl ?? "")
    .replace(/\{\{primary_color\}\}/g, brand.primaryColor ?? "")
    .replace(/\{\{footer_text\}\}/g, brand.footerText ?? "")
    .replace(/\{\{address\}\}/g, brand.address ?? "");

  return { subject, html };
}

export async function getTemplatesForConfig(configId: string): Promise<EmailTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .or(`config_id.eq.${configId},is_base.eq.true`)
    .order("is_base", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return (data ?? []) as EmailTemplate[];
}
