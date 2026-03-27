import { Pinecone } from "@pinecone-database/pinecone";
import type { ChatbotConfig } from "@/lib/supabase/chatbot-types";
import { RAG_TOP_K } from "./tier-defaults";

export interface RagChunk {
  text: string;
  score: number;
  source?: string;
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

export async function queryKnowledgeBase(
  userMessage: string,
  config: ChatbotConfig
): Promise<RagChunk[]> {
  if (!config.knowledge_source) {
    return [];
  }

  try {
    const client = getPineconeClient();

    let indexName: string;
    let namespace: string | undefined;

    if (config.knowledge_source.type === "index") {
      indexName = config.knowledge_source.name;
      namespace = undefined;
    } else {
      indexName = "ophidianai-kb";
      namespace = config.knowledge_source.name;
    }

    const index = client.index(indexName);
    const ns = namespace ? index.namespace(namespace) : index.namespace("");

    const results = await ns.searchRecords({
      query: {
        topK: RAG_TOP_K,
        inputs: { text: userMessage },
      },
    });

    if (!results?.result?.hits?.length) {
      return [];
    }

    return results.result.hits.map((hit) => {
      const fields = hit.fields as Record<string, unknown> | undefined;
      return {
        text: ((fields?.text ?? fields?.chunk_text ?? "") as string),
        score: hit._score,
        source: fields?.source as string | undefined,
      };
    });
  } catch (error) {
    console.error("[rag] Knowledge base query failed, continuing without context:", error);
    return [];
  }
}
