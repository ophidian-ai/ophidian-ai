import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@/lib/supabase/server";
import type { ChatbotTier } from "@/lib/supabase/chatbot-types";
import { TIER_DEFAULTS } from "./tier-defaults";

export interface DemoRequest {
  businessName: string;
  slug: string;
  websiteUrl: string;
  scrapedContent: Array<{ text: string; source: string }>;
  primaryColor?: string;
  systemPrompt?: string;
}

export interface DemoResult {
  config: any;
  demoUrl: string;
  embedCode: string;
  expiresAt: string;
}

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_CHATBOT_API_KEY || process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export async function provisionDemo(req: DemoRequest): Promise<DemoResult> {
  const { businessName, slug, websiteUrl, scrapedContent, primaryColor, systemPrompt } = req;

  // Upsert scraped content into Pinecone namespace demo-{slug}
  const client = getPineconeClient();
  const index = client.index("ophidianai-kb");
  const namespace = index.namespace(`demo-${slug}`);

  if (scrapedContent.length > 0) {
    const records = scrapedContent.map((chunk, i) => ({
      id: `${slug}-${i}`,
      text: chunk.text,
      source: chunk.source,
    }));
    for (const record of records) {
      await namespace.upsertRecords({ records: [record] });
    }
  }

  // Auto-generate system prompt if not provided
  const resolvedSystemPrompt =
    systemPrompt ??
    `You are a helpful assistant for ${businessName}. Answer questions about the business, its products, services, and policies based on the information provided. Be friendly, concise, and accurate. If you don't know the answer, suggest the visitor contact the business directly.`;

  // Compute expiry: 30 days from now
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const essentialsDefaults = TIER_DEFAULTS["essentials"];

  const supabase = await createClient();

  const { data: config, error } = await supabase
    .from("chatbot_configs")
    .insert({
      slug,
      system_prompt: resolvedSystemPrompt,
      tier: "essentials" as ChatbotTier,
      model: essentialsDefaults.model,
      is_demo: true,
      demo_expires_at: expiresAt,
      lead_capture_mode: "message_count",
      knowledge_source_type: "namespace",
      knowledge_source_name: `demo-${slug}`,
      page_limit: essentialsDefaults.pageLimit,
      monthly_conversation_cap: essentialsDefaults.monthlyConversationCap,
      custom_fields: false,
      remove_branding: false,
      direct_api_access: false,
      webhooks: false,
      ...(primaryColor ? { primary_color: primaryColor } : {}),
      website_url: websiteUrl,
      active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create demo config: ${error.message}`);
  }

  const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ophidianai.com"}/demo/${slug}`;
  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://ophidianai.com"}/widget.js" data-slug="${slug}" defer></script>`;

  return {
    config,
    demoUrl,
    embedCode,
    expiresAt,
  };
}

export async function convertDemoToProduction(
  configId: string,
  tier: ChatbotTier,
  clientId: string
): Promise<void> {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("chatbot_configs")
    .select("*")
    .eq("id", configId)
    .single();

  if (fetchError || !current) {
    throw new Error(`Failed to fetch config: ${fetchError?.message ?? "not found"}`);
  }

  const { slug } = current;
  const tierDefaults = TIER_DEFAULTS[tier];

  let knowledgeSourceType = tierDefaults.knowledgeSourceType;
  let knowledgeSourceName: string;

  if (tier === "pro") {
    // Create a dedicated Pinecone index for Pro tier
    const pinecone = getPineconeClient();
    const dedicatedIndexName = `chatbot-${slug}`;

    const existingIndexes = await pinecone.listIndexes();
    const exists = existingIndexes.indexes?.some((idx) => idx.name === dedicatedIndexName);

    if (!exists) {
      await pinecone.createIndexForModel({
        name: dedicatedIndexName,
        cloud: "aws",
        region: "us-east-1",
        embed: {
          model: "llama-text-embed-v2",
          fieldMap: { text: "text" },
        },
        deletionProtection: "disabled",
        waitUntilReady: false,
      });
    }

    knowledgeSourceType = "index";
    knowledgeSourceName = dedicatedIndexName;
    // Note: vector copy from demo namespace to production index deferred;
    // re-indexing from source is more reliable.
  } else {
    // Namespace-based: move from demo-{slug} to prod-{slug}
    knowledgeSourceName = `prod-${slug}`;
  }

  const { error: updateError } = await supabase
    .from("chatbot_configs")
    .update({
      is_demo: false,
      demo_expires_at: null,
      tier,
      client_id: clientId,
      knowledge_source_type: knowledgeSourceType,
      knowledge_source_name: knowledgeSourceName,
      model: tierDefaults.model,
      lead_capture_mode: tierDefaults.leadCaptureMode,
      page_limit: tierDefaults.pageLimit,
      monthly_conversation_cap: tierDefaults.monthlyConversationCap,
      custom_fields: tierDefaults.customFields,
      remove_branding: tierDefaults.removeBranding,
      direct_api_access: tierDefaults.directApiAccess,
      webhooks: tierDefaults.webhooks,
    })
    .eq("id", configId);

  if (updateError) {
    throw new Error(`Failed to update config: ${updateError.message}`);
  }
}
