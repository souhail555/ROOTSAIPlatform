export type PlatformId = 'facebook' | 'instagram' | 'tiktok' | 'twitter';

export interface PlatformConfig {
  id: PlatformId;
  nameAr: string;
  nameEn: string;
  handle: string;
  pageUrl: string;
  accountTypeAr: string;
  accountTypeEn: string;
  connected: boolean;
  avatarUrl: string;
  charLimit: number;
  badgeColor: string;
  accentBg: string;
}

export interface PostItem {
  id: string;
  text: string;
  mediaUrl: string | null;
  mediaName?: string;
  linkUrl?: string;
  hashtags: string[];
  customizedTexts?: Partial<Record<PlatformId, string>>;
  createdAt: string;
  scheduledTime?: string;
}

export type TwitterPublishMode = 'long_post' | 'thread' | 'summary';

export interface PublishResultItem {
  platformId: PlatformId;
  status: 'success' | 'failed';
  publishedAt: string;
  postId: string;
  url: string;
  pageUrl?: string;
  directIntentUrl?: string;
  twitterMode?: TwitterPublishMode;
  threadTweets?: string[];
}

export interface PublishHistoryRecord {
  id: string;
  postText: string;
  mediaUrl: string | null;
  timestamp: string;
  results: PublishResultItem[];
  isScheduled?: boolean;
  scheduledFor?: string; // ISO String
  status?: 'published' | 'scheduled' | 'cancelled';
  targetPlatforms?: PlatformId[];
  twitterMode?: TwitterPublishMode;
  threadTweets?: string[];
}
