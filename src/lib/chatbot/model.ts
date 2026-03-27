import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

// @ai-sdk/google expects GOOGLE_GENERATIVE_AI_API_KEY by default,
// but this project uses GEMINI_API_KEY. Create a custom provider instance.
function getGoogle() {
  return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Resolves a "provider/model" config string to an AI SDK model instance.
 *
 * Currently supports Google Gemini (GEMINI_API_KEY).
 * To add Anthropic/OpenAI later, install the provider package and add a case here.
 */
export function resolveModel(modelString: string): LanguageModel {
  const [provider, ...rest] = modelString.split("/");
  const modelId = rest.join("/");

  switch (provider) {
    case "google":
      return getGoogle()(modelId) as LanguageModel;
    // Future: case "anthropic": return anthropic(modelId);
    // Future: case "openai": return openai(modelId);
    default:
      console.warn(`[chatbot] Unknown provider "${provider}", falling back to gemini-2.5-flash`);
      return getGoogle()("gemini-2.5-flash") as LanguageModel;
  }
}
