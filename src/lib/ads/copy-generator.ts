import { generateText } from "ai";

export interface CopyRequest {
  platform: "google" | "meta";
  adType: string;
  businessName: string;
  industry: string;
  location: string;
  objective: string;
  targetAudience?: string;
}

export interface CopyResult {
  headlines: string[];
  descriptions: string[];
  callToAction: string;
  targetAudience: string;
}

export async function generateAdCopy(request: CopyRequest): Promise<CopyResult> {
  const charLimits =
    request.platform === "google"
      ? "Headlines: max 30 chars each. Descriptions: max 90 chars each."
      : "Primary text: max 125 chars. Headline: max 40 chars. Description: max 30 chars.";

  const { text } = await generateText({
    model: "anthropic/claude-haiku-4.5" as any,
    prompt: `Generate ${request.platform} ${request.adType} ad copy for ${request.businessName}, a ${request.industry} business in ${request.location}.\n\nObjective: ${request.objective}\nTarget audience: ${request.targetAudience || "local customers"}\n\n${charLimits}\n\nGenerate 3 variant sets. Return JSON: { "headlines": [...], "descriptions": [...], "callToAction": "...", "targetAudience": "..." }`,
  });

  try {
    return JSON.parse(text);
  } catch {
    return {
      headlines: [text.slice(0, 30)],
      descriptions: [text.slice(0, 90)],
      callToAction: "Learn More",
      targetAudience: request.targetAudience || "local customers",
    };
  }
}
