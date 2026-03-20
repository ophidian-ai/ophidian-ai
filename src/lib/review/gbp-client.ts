import { Redis } from "@upstash/redis";
import type { ReviewConfig } from "@/lib/supabase/review-types";

// Google My Business API v4 base URL
const GBP_API_BASE = "https://mybusiness.googleapis.com/v4";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

function tokenCacheKey(configId: string): string {
  return `gbp:token:${configId}`;
}

export interface GbpReview {
  name: string; // accounts/{account}/locations/{location}/reviews/{review}
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GbpListReviewsResponse {
  reviews?: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

export interface GbpLocation {
  name: string;
  metadata?: {
    mapsUrl?: string;
    newReviewUrl?: string;
  };
}

const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starRatingToNumber(rating: string): number {
  return STAR_RATING_MAP[rating] ?? 0;
}

/**
 * Refresh and cache a short-lived GBP access token using the stored refresh token.
 * Token is cached in Redis for 55 minutes (Google tokens expire at 60 min).
 */
export async function refreshGbpAccessToken(config: ReviewConfig): Promise<string> {
  const redisClient = getRedis();
  const key = tokenCacheKey(config.id);

  const cached = await redisClient.get<string>(key);
  if (cached) {
    return typeof cached === "string" ? cached : JSON.stringify(cached);
  }

  // TODO: GBP OAuth requires a registered Google Cloud project with the
  // Business Profile API enabled. The client_id/client_secret live in env vars.
  // Replace these TODOs with actual values once the GCP project is configured.
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GBP_CLIENT_ID ?? "",
      client_secret: process.env.GBP_CLIENT_SECRET ?? "",
      refresh_token: config.gbp_oauth_token ?? "",
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GBP token refresh failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const accessToken = json.access_token as string;

  // Cache for 55 minutes (tokens expire at 60)
  await redisClient.set(key, accessToken, { ex: 55 * 60 });

  return accessToken;
}

/**
 * List reviews for a GBP location.
 * Paginates automatically when pageToken is provided.
 *
 * NOTE: The Google My Business API v4 requires Business Profile API access
 * from a verified Google Cloud project. The API calls below are fully wired
 * but will return 403/404 until GCP credentials are configured.
 */
export async function listGbpReviews(
  config: ReviewConfig,
  pageToken?: string
): Promise<GbpListReviewsResponse> {
  if (!config.gbp_account_id || !config.gbp_location_id) {
    // Return empty mock structure if GBP is not connected
    return { reviews: [] };
  }

  let accessToken: string;
  try {
    accessToken = await refreshGbpAccessToken(config);
  } catch (err) {
    console.error("[gbp-client] Token refresh failed:", err);
    return { reviews: [] };
  }

  const url = new URL(
    `${GBP_API_BASE}/accounts/${config.gbp_account_id}/locations/${config.gbp_location_id}/reviews`
  );
  url.searchParams.set("pageSize", "50");
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    // Token stale -- clear cache and retry once
    const redisClient = getRedis();
    await redisClient.del(tokenCacheKey(config.id));
    const freshToken = await refreshGbpAccessToken(config);
    const retryRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    if (!retryRes.ok) {
      console.error(`[gbp-client] listGbpReviews retry failed: ${retryRes.status}`);
      return { reviews: [] };
    }
    return (await retryRes.json()) as GbpListReviewsResponse;
  }

  if (!res.ok) {
    console.error(`[gbp-client] listGbpReviews failed: ${res.status}`);
    return { reviews: [] };
  }

  return (await res.json()) as GbpListReviewsResponse;
}

/**
 * Post (or update) a reply to a GBP review.
 */
export async function postGbpResponse(
  config: ReviewConfig,
  platformReviewId: string,
  responseText: string
): Promise<boolean> {
  if (!config.gbp_account_id || !config.gbp_location_id) {
    console.warn("[gbp-client] Cannot post response: GBP not connected");
    return false;
  }

  let accessToken: string;
  try {
    accessToken = await refreshGbpAccessToken(config);
  } catch (err) {
    console.error("[gbp-client] Token refresh failed for postGbpResponse:", err);
    return false;
  }

  const url = `${GBP_API_BASE}/accounts/${config.gbp_account_id}/locations/${config.gbp_location_id}/reviews/${platformReviewId}/reply`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: responseText }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[gbp-client] postGbpResponse failed: ${res.status} ${text}`);
    return false;
  }

  return true;
}

/**
 * Get GBP location metadata, including the review link URL.
 */
export async function getGbpLocation(config: ReviewConfig): Promise<GbpLocation | null> {
  if (!config.gbp_account_id || !config.gbp_location_id) {
    return null;
  }

  let accessToken: string;
  try {
    accessToken = await refreshGbpAccessToken(config);
  } catch (err) {
    console.error("[gbp-client] Token refresh failed for getGbpLocation:", err);
    return null;
  }

  const url = `${GBP_API_BASE}/accounts/${config.gbp_account_id}/locations/${config.gbp_location_id}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error(`[gbp-client] getGbpLocation failed: ${res.status}`);
    return null;
  }

  return (await res.json()) as GbpLocation;
}
