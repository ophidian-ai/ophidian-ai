import { loadConfig } from "@/lib/chatbot/config";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await loadConfig(slug);
  if (!config) notFound();

  return (
    <ChatWidget
      slug={slug}
      greeting={config.greeting}
      theme={config.theme}
      leadCapture={config.lead_capture}
      tier={config.tier}
      showBranding={config.tier !== "pro"}
    />
  );
}
