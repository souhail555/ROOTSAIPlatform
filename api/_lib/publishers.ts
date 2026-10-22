/**
 * Real platform publishers for X (Twitter) API v2 and Meta (Facebook) Graph API.
 * Falls back to share-intent links when credentials are missing.
 *
 * Env vars:
 *   X_API_BEARER_TOKEN        — X API v2 OAuth 2.0 bearer token (read+write app-only won't post; use OAuth user context token)
 *   X_ACCESS_TOKEN            — OAuth 1.0a/2.0 user access token for posting
 *   FACEBOOK_PAGE_ACCESS_TOKEN— Facebook Page access token
 *   FACEBOOK_PAGE_ID          — Facebook Page ID
 */

export interface PublishOutcome {
  status: "published" | "failed" | "manual";
  postId: string;
  url?: string;
  message: string;
}

function env(name: string): string {
  return process.env[name] || "";
}

/** Publish to X via API v2 (OAuth 2.0 user access token) */
async function publishToX(text: string): Promise<PublishOutcome> {
  const token = env("X_ACCESS_TOKEN") || env("X_API_BEARER_TOKEN");
  if (!token) {
    return {
      status: "manual",
      postId: "",
      message: "X API credentials not configured — share link prepared",
    };
  }
  try {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.slice(0, 280) }),
    });
    const json: any = await res.json();
    if (res.ok && json?.data?.id) {
      return {
        status: "published",
        postId: json.data.id,
        url: `https://x.com/-/status/${json.data.id}`,
        message: "تم النشر على X بنجاح عبر API",
      };
    }
    return {
      status: "failed",
      postId: "",
      message: json?.detail || json?.title || "X API error",
    };
  } catch (e: any) {
    return {
      status: "failed",
      postId: "",
      message: e?.message || "X API network error",
    };
  }
}

/** Publish to Facebook Page via Graph API */
async function publishToFacebook(
  text: string,
  linkUrl?: string,
): Promise<PublishOutcome> {
  const pageToken = env("FACEBOOK_PAGE_ACCESS_TOKEN");
  const pageId = env("FACEBOOK_PAGE_ID");
  if (!pageToken || !pageId) {
    return {
      status: "manual",
      postId: "",
      message: "Facebook API credentials not configured — share link prepared",
    };
  }
  try {
    const params = new URLSearchParams({
      message: text,
      access_token: pageToken,
    });
    if (linkUrl) params.append("link", linkUrl);
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const json: any = await res.json();
    if (res.ok && json?.id) {
      return {
        status: "published",
        postId: json.id,
        url: `https://www.facebook.com/${json.id}`,
        message: "تم النشر على فيسبوك بنجاح عبر Graph API",
      };
    }
    return {
      status: "failed",
      postId: "",
      message: json?.error?.message || "Facebook Graph API error",
    };
  } catch (e: any) {
    return {
      status: "failed",
      postId: "",
      message: e?.message || "Facebook API network error",
    };
  }
}

export async function publishToPlatform(
  platform: string,
  text: string,
  linkUrl?: string,
): Promise<PublishOutcome | null> {
  if (platform === "twitter") return publishToX(text);
  if (platform === "facebook") return publishToFacebook(text, linkUrl);
  // Instagram & TikTok require media + review; keep manual flow
  return null;
}

export function hasRealCredentials(platform: string): boolean {
  if (platform === "twitter")
    return !!(env("X_ACCESS_TOKEN") || env("X_API_BEARER_TOKEN"));
  if (platform === "facebook")
    return !!(env("FACEBOOK_PAGE_ACCESS_TOKEN") && env("FACEBOOK_PAGE_ID"));
  return false;
}
