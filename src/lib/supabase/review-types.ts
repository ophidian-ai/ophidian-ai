export type ReviewTier = "essentials" | "growth" | "pro";
export type ReviewResponseStatus = "draft" | "approved" | "posted" | "rejected";
export type ReviewCampaignStatus = "draft" | "scheduled" | "sent" | "completed";

export interface BrandVoice {
  tone: string;
  guidelines: string;
  signoff: string;
}

export interface ReviewConfig {
  id: string;
  client_id: string;
  tier: ReviewTier;
  gbp_account_id: string | null;
  gbp_location_id: string | null;
  gbp_oauth_token: string | null;
  yelp_url: string | null;
  facebook_page_id: string | null;
  brand_voice: BrandVoice;
  auto_respond_positive: boolean;
  auto_respond_negative: boolean;
  escalation_email: string | null;
  competitor_gbp_ids: string[];
  notification_email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  config_id: string;
  platform: string;
  platform_review_id: string;
  author_name: string;
  author_image_url: string | null;
  rating: number;
  text: string | null;
  review_date: string;
  sentiment: string | null;
  response_status: string;
  is_competitor: boolean;
  competitor_name: string | null;
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  config_id: string;
  generated_text: string;
  final_text: string | null;
  status: ReviewResponseStatus;
  auto_posted: boolean;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewCampaign {
  id: string;
  config_id: string;
  name: string;
  review_link: string;
  contacts_targeted: number;
  emails_sent: number;
  emails_opened: number;
  link_clicked: number;
  reviews_attributed: number;
  status: ReviewCampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewAnalytics {
  id: string;
  config_id: string;
  date: string;
  platform: string;
  total_reviews: number;
  average_rating: number;
  new_reviews: number;
  responses_posted: number;
  response_rate: number;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  created_at: string;
}
