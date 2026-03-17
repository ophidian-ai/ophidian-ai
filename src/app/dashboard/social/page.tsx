"use client";

import { useState, useCallback } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Facebook,
  Instagram,
  Link2,
  Unlink,
  Send,
  Image as ImageIcon,
  Video,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  Heart,
  Eye,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ConnectedPage {
  id: string;
  name: string;
  accessToken: string;
  category: string;
  instagram?: {
    id: string;
    username: string;
  };
}

interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

interface RecentPost {
  id: string;
  message: string;
  created_time: string;
  likes: number;
  comments: number;
  shares: number;
  platform: "facebook" | "instagram";
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "3021291744732407";

const FB_PERMISSIONS = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_metadata",
  "pages_read_user_content",
  "pages_manage_engagement",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_insights",
  "read_insights",
  "ads_management",
  "ads_read",
].join(",");

const OAUTH_URL = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent("https://ophidianai.com/api/meta/callback")}&scope=${FB_PERMISSIONS}&response_type=code`;

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SocialPage() {
  const { role } = useDashboard();

  // Admin always has access; client access can be gated via ModuleGuard later
  return <SocialContent isAdmin={role === "admin"} />;
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

function SocialContent({ isAdmin }: { isAdmin: boolean }) {
  const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [postText, setPostText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "carousel">("image");
  const [publishTo, setPublishTo] = useState<{ facebook: boolean; instagram: boolean }>({
    facebook: true,
    instagram: true,
  });
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Check URL params for OAuth callback result
  useState(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const metaConnected = params.get("meta_connected");
    const metaError = params.get("meta_error");

    if (metaConnected === "true") {
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/social");
      // In production, tokens would be stored server-side
      // For demo, we'll fetch pages with a stored token
    }

    if (metaError) {
      window.history.replaceState({}, "", "/dashboard/social");
    }
  });

  /* ---- Connect to Meta ---- */

  const handleConnect = useCallback(() => {
    setConnecting(true);
    window.location.href = OAUTH_URL;
  }, []);

  const handleDisconnect = useCallback((pageId: string) => {
    setConnectedPages((prev) => prev.filter((p) => p.id !== pageId));
    setPublishResults([]);
  }, []);

  /* ---- Demo: Simulate connecting with test data ---- */

  const handleDemoConnect = useCallback(() => {
    setConnectedPages([
      {
        id: "635587472960991",
        name: "OphidianAI",
        accessToken: "demo_token",
        category: "Consulting agency",
        instagram: {
          id: "17841466559697941",
          username: "ophidianai",
        },
      },
    ]);
    setSelectedPageId("635587472960991");
  }, []);

  /* ---- Publish Post ---- */

  const handlePublish = useCallback(async () => {
    if (!selectedPageId || (!postText && !mediaUrl)) return;

    const page = connectedPages.find((p) => p.id === selectedPageId);
    if (!page) return;

    setPublishing(true);
    setPublishResults([]);

    const results: PublishResult[] = [];

    // Publish to Facebook Page
    if (publishTo.facebook) {
      try {
        const params: Record<string, string> = {
          access_token: page.accessToken,
        };

        if (postText) params.message = postText;
        if (mediaUrl) params.link = mediaUrl;

        const response = await fetch(
          `https://graph.facebook.com/v25.0/${page.id}/feed`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          }
        );

        const data = await response.json();

        if (data.id) {
          results.push({
            success: true,
            platform: "Facebook",
            postId: data.id,
          });
        } else {
          results.push({
            success: false,
            platform: "Facebook",
            error: data.error?.message || "Failed to publish",
          });
        }
      } catch (err) {
        results.push({
          success: false,
          platform: "Facebook",
          error: err instanceof Error ? err.message : "Network error",
        });
      }
    }

    // Publish to Instagram
    if (publishTo.instagram && page.instagram && mediaUrl) {
      try {
        // Step 1: Create media container
        const containerParams: Record<string, string> = {
          access_token: page.accessToken,
          caption: postText || "",
        };

        if (mediaType === "video") {
          containerParams.media_type = "REELS";
          containerParams.video_url = mediaUrl;
        } else {
          containerParams.image_url = mediaUrl;
        }

        const containerResponse = await fetch(
          `https://graph.facebook.com/v25.0/${page.instagram.id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(containerParams),
          }
        );

        const containerData = await containerResponse.json();

        if (containerData.id) {
          // Step 2: Publish the container
          const publishResponse = await fetch(
            `https://graph.facebook.com/v25.0/${page.instagram.id}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_token: page.accessToken,
                creation_id: containerData.id,
              }),
            }
          );

          const publishData = await publishResponse.json();

          if (publishData.id) {
            results.push({
              success: true,
              platform: "Instagram",
              postId: publishData.id,
            });
          } else {
            results.push({
              success: false,
              platform: "Instagram",
              error: publishData.error?.message || "Failed to publish",
            });
          }
        } else {
          results.push({
            success: false,
            platform: "Instagram",
            error: containerData.error?.message || "Failed to create container",
          });
        }
      } catch (err) {
        results.push({
          success: false,
          platform: "Instagram",
          error: err instanceof Error ? err.message : "Network error",
        });
      }
    }

    setPublishResults(results);
    setPublishing(false);
  }, [selectedPageId, postText, mediaUrl, mediaType, publishTo, connectedPages]);

  /* ---- Fetch Recent Posts ---- */

  const fetchRecentPosts = useCallback(async () => {
    if (!selectedPageId) return;
    const page = connectedPages.find((p) => p.id === selectedPageId);
    if (!page) return;

    setLoadingPosts(true);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${page.id}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&limit=5&access_token=${page.accessToken}`
      );

      const data = await response.json();

      if (data.data) {
        const posts: RecentPost[] = data.data.map(
          (post: {
            id: string;
            message?: string;
            created_time: string;
            likes?: { summary?: { total_count?: number } };
            comments?: { summary?: { total_count?: number } };
            shares?: { count?: number };
          }) => ({
            id: post.id,
            message: post.message || "(No text)",
            created_time: post.created_time,
            likes: post.likes?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
            platform: "facebook" as const,
          })
        );
        setRecentPosts(posts);
      }
    } catch {
      // Silent fail for demo
    }

    setLoadingPosts(false);
  }, [selectedPageId, connectedPages]);

  /* ---- Render ---- */

  const selectedPage = connectedPages.find((p) => p.id === selectedPageId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Social Media</h1>
        {isAdmin && (
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/20 text-primary border border-primary/30">
            Admin View
          </span>
        )}
      </div>

      {/* Connection Section */}
      {connectedPages.length === 0 ? (
        <GlowCard className="rounded-xl border border-primary/10 p-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
                <Facebook size={24} className="text-[#1877F2]" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 flex items-center justify-center">
                <Instagram size={24} className="text-[#DD2A7B]" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Connect Your Social Accounts
            </h2>
            <p className="text-sm text-foreground-muted mb-6">
              Link your Facebook Page and Instagram Professional account to
              publish content, monitor engagement, and manage comments from one
              place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1877F2] text-white font-medium hover:bg-[#1877F2]/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {connecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Link2 size={18} />
                )}
                Connect with Facebook
              </button>
              {isAdmin && (
                <button
                  onClick={handleDemoConnect}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/20 text-foreground-muted font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Load Demo Data
                </button>
              )}
            </div>
          </div>
        </GlowCard>
      ) : (
        <>
          {/* Connected Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedPages.map((page) => (
              <GlowCard
                key={page.id}
                className="rounded-xl border border-primary/10 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                      <Facebook size={20} className="text-[#1877F2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {page.name}
                      </p>
                      <p className="text-xs text-foreground-dim">
                        {page.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(page.id)}
                    className="text-foreground-dim hover:text-red-400 transition-colors cursor-pointer"
                    title="Disconnect"
                  >
                    <Unlink size={16} />
                  </button>
                </div>
                {page.instagram && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
                    <Instagram size={16} className="text-[#DD2A7B]" />
                    <span className="text-sm text-foreground-muted">
                      @{page.instagram.username}
                    </span>
                    <CheckCircle2
                      size={14}
                      className="text-green-400 ml-auto"
                    />
                  </div>
                )}
              </GlowCard>
            ))}

            {/* Add another account */}
            <button
              onClick={handleConnect}
              className="rounded-xl border border-dashed border-primary/20 p-5 flex flex-col items-center justify-center gap-2 text-foreground-dim hover:text-foreground hover:border-primary/40 transition-colors min-h-[120px] cursor-pointer"
            >
              <Link2 size={20} />
              <span className="text-sm">Connect another Page</span>
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlowCard className="rounded-xl border border-primary/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-primary" />
                <p className="text-sm text-foreground-dim">Connected Pages</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {connectedPages.length}
              </p>
            </GlowCard>
            <GlowCard className="rounded-xl border border-primary/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Instagram size={16} className="text-[#DD2A7B]" />
                <p className="text-sm text-foreground-dim">IG Accounts</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {connectedPages.filter((p) => p.instagram).length}
              </p>
            </GlowCard>
            <GlowCard className="rounded-xl border border-primary/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className="text-foreground-muted" />
                <p className="text-sm text-foreground-dim">Total Reach</p>
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
            </GlowCard>
            <GlowCard className="rounded-xl border border-primary/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-red-400" />
                <p className="text-sm text-foreground-dim">Engagement</p>
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
            </GlowCard>
          </div>

          {/* Page Selector */}
          {connectedPages.length > 1 && (
            <div className="glass rounded-xl border border-primary/10 p-4">
              <label className="text-sm text-foreground-dim mb-2 block">
                Select Page
              </label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full bg-background border border-primary/10 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary/30"
              >
                {connectedPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                    {page.instagram
                      ? ` + @${page.instagram.username}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Compose & Publish */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composer */}
            <div className="lg:col-span-2 glass rounded-xl border border-primary/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Compose Post
              </h2>

              {/* Platform toggles */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() =>
                    setPublishTo((p) => ({ ...p, facebook: !p.facebook }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    publishTo.facebook
                      ? "bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30"
                      : "text-foreground-dim border border-primary/10 hover:bg-white/5"
                  }`}
                >
                  <Facebook size={16} />
                  Facebook
                </button>
                <button
                  onClick={() =>
                    setPublishTo((p) => ({ ...p, instagram: !p.instagram }))
                  }
                  disabled={!selectedPage?.instagram}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    publishTo.instagram && selectedPage?.instagram
                      ? "bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30"
                      : "text-foreground-dim border border-primary/10 hover:bg-white/5"
                  }`}
                >
                  <Instagram size={16} />
                  Instagram
                </button>
              </div>

              {/* Text input */}
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What would you like to post?"
                rows={4}
                className="w-full bg-background/50 border border-primary/10 rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-foreground-dim focus:outline-none focus:border-primary/30 resize-none"
              />

              {/* Media input */}
              <div className="mt-3">
                <label className="text-sm text-foreground-dim mb-2 block">
                  Media URL (must be publicly accessible)
                </label>
                <div className="flex gap-2">
                  <input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-background/50 border border-primary/10 rounded-lg px-4 py-2 text-foreground text-sm placeholder:text-foreground-dim focus:outline-none focus:border-primary/30"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMediaType("image")}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        mediaType === "image"
                          ? "bg-primary/20 text-primary"
                          : "text-foreground-dim hover:text-foreground"
                      }`}
                      title="Image"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button
                      onClick={() => setMediaType("video")}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        mediaType === "video"
                          ? "bg-primary/20 text-primary"
                          : "text-foreground-dim hover:text-foreground"
                      }`}
                      title="Video / Reel"
                    >
                      <Video size={18} />
                    </button>
                    <button
                      onClick={() => setMediaType("carousel")}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        mediaType === "carousel"
                          ? "bg-primary/20 text-primary"
                          : "text-foreground-dim hover:text-foreground"
                      }`}
                      title="Carousel"
                    >
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Publish button */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                <p className="text-xs text-foreground-dim">
                  {publishTo.facebook && publishTo.instagram
                    ? "Publishing to Facebook + Instagram"
                    : publishTo.facebook
                      ? "Publishing to Facebook only"
                      : publishTo.instagram
                        ? "Publishing to Instagram only"
                        : "Select a platform"}
                </p>
                <button
                  onClick={handlePublish}
                  disabled={
                    publishing ||
                    (!postText && !mediaUrl) ||
                    (!publishTo.facebook && !publishTo.instagram)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {publishing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Publish Now
                </button>
              </div>

              {/* Publish Results */}
              {publishResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {publishResults.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        result.success
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>
                        {result.platform}:{" "}
                        {result.success
                          ? `Published (ID: ${result.postId})`
                          : result.error}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Posts */}
            <div className="glass rounded-xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Posts
                </h2>
                <button
                  onClick={fetchRecentPosts}
                  disabled={loadingPosts}
                  className="text-foreground-dim hover:text-foreground transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    className={loadingPosts ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare
                    size={32}
                    className="text-foreground-dim mx-auto mb-2"
                  />
                  <p className="text-sm text-foreground-dim">
                    {loadingPosts
                      ? "Loading posts..."
                      : "Click refresh to load recent posts"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg bg-background/50 border border-primary/5"
                    >
                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {post.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-foreground-dim">
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} /> {post.comments}
                        </span>
                        <span className="ml-auto">
                          {new Date(post.created_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
