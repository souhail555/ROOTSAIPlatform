import React, { useState } from 'react';
import { PlatformId, PlatformConfig } from '../types';
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterXIcon } from './SocialIcons';
import {
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  Bookmark,
  Send,
  MoreHorizontal,
  Globe2,
  Music,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Layers,
  ListOrdered,
} from 'lucide-react';
import { TwitterPublishMode } from '../types';
import { splitTextIntoTwitterThread } from '../utils/twitterThread';

interface PlatformPreviewProps {
  platform: PlatformId;
  text: string;
  mediaUrl: string | null;
  linkUrl?: string;
  config: PlatformConfig;
  lang: 'ar' | 'en';
  onUseAdaptedText?: () => void;
  adaptedAvailable?: boolean;
  twitterMode?: TwitterPublishMode;
  onTwitterModeChange?: (mode: TwitterPublishMode) => void;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({
  platform,
  text,
  mediaUrl,
  linkUrl,
  config,
  lang,
  twitterMode = 'long_post',
  onTwitterModeChange,
}) => {
  const isArabic = lang === 'ar';
  const charLength = text.length;
  const wordCount = text && text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const [expandedFb, setExpandedFb] = useState(false);
  const [expandedTw, setExpandedTw] = useState(false);
  const [copiedThreadIdx, setCopiedThreadIdx] = useState<number | null>(null);
  const [copiedAllThread, setCopiedAllThread] = useState(false);
  const [copiedLongPost, setCopiedLongPost] = useState(false);

  const threadTweets = splitTextIntoTwitterThread(text);

  // Render text with clickable styled hashtags
  const formatTextWithHashtags = (rawText: string) => {
    if (!rawText) return null;
    const parts = rawText.split(/(#[^\s#]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Header of Preview Box */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          {platform === 'facebook' && <FacebookIcon className="w-4 h-4 text-blue-600" />}
          {platform === 'instagram' && <InstagramIcon className="w-4 h-4 text-pink-600" />}
          {platform === 'twitter' && <TwitterXIcon className="w-4 h-4 text-slate-900" />}
          {platform === 'tiktok' && <TikTokIcon className="w-4 h-4 text-slate-900" />}
          <span className="text-sm font-semibold text-slate-800">
            {isArabic ? config.nameAr : config.nameEn}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">{config.handle}</span>
        </div>

        <div className="flex items-center gap-2">
          {config.pageUrl && (
            <a
              href={config.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 transition-colors"
              title={config.pageUrl}
            >
              <span>{isArabic ? 'الرابط الرسمي' : 'Official Page'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {wordCount.toLocaleString()} {isArabic ? 'كلمة' : 'words'}
          </span>
          {platform === 'twitter' ? (
            <span
              className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded ${
                isOverLimit
                  ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                  : 'text-slate-500 bg-slate-100'
              }`}
            >
              {isOverLimit
                ? isArabic
                  ? 'مقال مطول (+280)'
                  : 'Long Post'
                : `${280 - charLength} ${isArabic ? 'حرف متبقي' : 'left'}`}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-400">
              {charLength.toLocaleString()} {isArabic ? 'حرف' : 'chars'}
            </span>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="p-4 flex-1 flex flex-col justify-center bg-slate-50/30 overflow-y-auto max-h-[500px]">
        {platform === 'facebook' && (
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs max-w-md mx-auto w-full">
            {/* Facebook Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={config.avatarUrl}
                  alt={config.handle}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                    {isArabic ? config.nameAr : config.nameEn}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <span>{isArabic ? 'الآن' : 'Just now'}</span>
                    <span>·</span>
                    <Globe2 className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
              <button type="button" aria-label="More" className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Facebook Content */}
            <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-3">
              <p>
                {formatTextWithHashtags(
                  expandedFb || text.length <= 420
                    ? text || (isArabic ? 'اكتب منشورك للمعاينة...' : 'Write your post to preview...')
                    : text.slice(0, 400) + '...'
                )}
              </p>
              {text.length > 420 && (
                <button
                  type="button"
                  onClick={() => setExpandedFb(!expandedFb)}
                  className="text-xs font-bold text-blue-600 hover:underline mt-1.5 cursor-pointer block"
                >
                  {expandedFb
                    ? isArabic
                      ? 'عرض أقل ▲'
                      : 'See less ▲'
                    : isArabic
                    ? `عرض المقال كاملاً (${wordCount.toLocaleString()} كلمة) ▼`
                    : `Read full post (${wordCount.toLocaleString()} words) ▼`}
                </button>
              )}
            </div>

            {/* Media if present */}
            {mediaUrl && (
              <div className="mb-3 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={mediaUrl}
                  alt="Post attachment"
                  className="w-full max-h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Link preview if present */}
            {linkUrl && (
              <div className="mb-3 p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="truncate flex-1">
                  <span className="font-semibold text-slate-800 block truncate">{linkUrl}</span>
                  <span className="text-slate-400">{isArabic ? 'انقر لفتح الرابط' : 'Click to visit'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            )}

            {/* Facebook Engagement */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
              <button type="button" className="flex items-center gap-1.5 hover:text-blue-600 py-1 px-2 rounded">
                <Heart className="w-4 h-4" />
                <span>{isArabic ? 'إعجاب' : 'Like'}</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-slate-900 py-1 px-2 rounded">
                <MessageCircle className="w-4 h-4" />
                <span>{isArabic ? 'تعليق' : 'Comment'}</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-slate-900 py-1 px-2 rounded">
                <Share2 className="w-4 h-4" />
                <span>{isArabic ? 'مشاركة' : 'Share'}</span>
              </button>
            </div>
          </div>
        )}

        {platform === 'twitter' && (
          <div className="space-y-3 max-w-md mx-auto w-full">
            {/* Twitter Publishing Mode Switcher for Long Content */}
            {charLength > 280 && (
              <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 px-2 py-1 flex items-center justify-between">
                  <span>{isArabic ? 'اختر طريقة وصول النص كاملاً إلى X (تويتر):' : 'Select X Delivery Mode:'}</span>
                  <span className="font-mono text-indigo-600 font-semibold">{wordCount.toLocaleString()} {isArabic ? 'كلمة' : 'words'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => onTwitterModeChange?.('long_post')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      twitterMode === 'long_post'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isArabic ? 'مقال مطول كامل' : 'Long Post'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTwitterModeChange?.('thread')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      twitterMode === 'thread'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isArabic ? `ثريد مقسم (${threadTweets.length})` : `Thread (${threadTweets.length})`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* THREAD MODE VIEW */}
            {twitterMode === 'thread' && threadTweets.length > 1 ? (
              <div className="space-y-3">
                {/* Thread Header Banner */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧵</span>
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">
                        {isArabic ? `سلسلة تغريدات منظمة (${threadTweets.length} تغريدات)` : `Sequential Thread (${threadTweets.length} Tweets)`}
                      </h5>
                      <p className="text-[11px] text-amber-700">
                        {isArabic ? 'تم تقسيم المقال كاملاً تلقائياً مع ترقيم الأجزاء بدقة' : 'Full text organized sequentially'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(threadTweets.join('\n\n---\n\n'));
                      setCopiedAllThread(true);
                      setTimeout(() => setCopiedAllThread(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shrink-0"
                  >
                    {copiedAllThread ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAllThread ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ السلسلة' : 'Copy All')}</span>
                  </button>
                </div>

                {/* Vertical Thread Stream */}
                <div className="relative space-y-2 before:absolute before:top-4 before:bottom-4 before:right-6 rtl:before:right-6 ltr:before:left-6 before:w-0.5 before:bg-slate-200">
                  {threadTweets.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="relative bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs z-10 transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={config.avatarUrl}
                            alt={config.handle}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-bold text-slate-900">{config.nameAr}</span>
                              <span className="text-slate-400 font-mono text-[11px]">{config.handle}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {idx + 1} / {threadTweets.length} {idx === 0 ? '🧵' : ''}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {formatTextWithHashtags(tweet)}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono tabular-nums">
                          {tweet.length} / 280 {isArabic ? 'حرف' : 'chars'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(tweet);
                              setCopiedThreadIdx(idx);
                              setTimeout(() => setCopiedThreadIdx(null), 2000);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title={isArabic ? 'نسخ هذه التغريدة فقط' : 'Copy this tweet'}
                          >
                            {copiedThreadIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedThreadIdx === idx ? (isArabic ? 'تم' : 'Done') : (isArabic ? 'نسخ' : 'Copy')}</span>
                          </button>

                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors"
                          >
                            <span>{isArabic ? 'تغريد' : 'Tweet'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* LONG-FORM SINGLE POST VIEW */
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
                {/* Affirmative Confirmation Banner */}
                {charLength > 280 && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="leading-snug">
                        {isArabic
                          ? `منشور مطول كامل (${wordCount.toLocaleString()} كلمة): سيصل النص كاملاً إلى منصة X كمنشور موثق حتى 25,000 حرف.`
                          : `Full post (${wordCount.toLocaleString()} words) will reach X as a long-form article post.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(text);
                        setCopiedLongPost(true);
                        setTimeout(() => setCopiedLongPost(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      {copiedLongPost ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLongPost ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ النص' : 'Copy')}</span>
                    </button>
                  </div>
                )}

                {/* Twitter Tweet Card Header */}
                <div className="flex items-start gap-3">
                  <img
                    src={config.avatarUrl}
                    alt={config.handle}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-bold text-slate-900 truncate">
                        {isArabic ? config.nameAr : config.nameEn}
                      </span>
                      <span className="text-slate-500 text-xs font-mono truncate">{config.handle}</span>
                      <span className="text-slate-400 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{isArabic ? 'الآن' : 'now'}</span>
                    </div>

                    {/* Tweet Body */}
                    <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed mt-1">
                      <p>
                        {formatTextWithHashtags(
                          expandedTw || text.length <= 320
                            ? text || (isArabic ? 'ماذا يحدث؟ اكتب تغريدتك...' : "What's happening?")
                            : text.slice(0, 300) + '...'
                        )}
                      </p>
                      {text.length > 320 && (
                        <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isArabic ? `مقال كامل (${wordCount.toLocaleString()} كلمة)` : `Full post (${wordCount} words)`}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedTw(!expandedTw)}
                            className="text-indigo-600 hover:underline font-medium text-[11px] cursor-pointer"
                          >
                            {expandedTw ? (isArabic ? 'عرض أقل ▲' : 'Show less ▲') : (isArabic ? 'عرض كامل النص ▼' : 'Show full text ▼')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Media */}
                    {mediaUrl && (
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={mediaUrl}
                          alt="Tweet attachment"
                          className="w-full max-h-60 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Tweet Footer Icons */}
                    <div className="flex items-center justify-between text-slate-500 mt-3 pt-2 text-xs">
                      <button type="button" className="flex items-center gap-1 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>14</span>
                      </button>
                      <button type="button" className="flex items-center gap-1 hover:text-green-500">
                        <Repeat2 className="w-4 h-4" />
                        <span>28</span>
                      </button>
                      <button type="button" className="flex items-center gap-1 hover:text-pink-500">
                        <Heart className="w-4 h-4" />
                        <span>142</span>
                      </button>
                      <button type="button" className="flex items-center gap-1 hover:text-blue-500">
                        <Bookmark className="w-4 h-4" />
                        <span>9</span>
                      </button>
                      <button type="button" className="hover:text-slate-800">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {platform === 'instagram' && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs max-w-sm mx-auto w-full">
            {/* Instagram Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <img
                    src={config.avatarUrl}
                    alt={config.handle}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">{config.handle}</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-600 cursor-pointer" />
            </div>

            {/* Media / Square Placeholder */}
            <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="Instagram post"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <InstagramIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">
                    {isArabic ? 'انستقرام يفضل وجود صورة للمنشور' : 'Instagram recommends an image'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-slate-800">
                  <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                  <MessageCircle className="w-5 h-5 cursor-pointer" />
                  <Send className="w-5 h-5 cursor-pointer" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-800 cursor-pointer" />
              </div>

              {/* Likes */}
              <p className="text-xs font-semibold text-slate-900 mb-1">
                {isArabic ? 'أعجب به 482 شخصاً' : '482 likes'}
              </p>

              {/* Caption */}
              <div className="text-xs text-slate-800 leading-relaxed">
                <span className="font-bold mr-1.5 font-mono">{config.handle}</span>
                <span className="whitespace-pre-wrap">
                  {formatTextWithHashtags(text || (isArabic ? 'كابشن انستقرام المميز...' : 'Instagram caption...'))}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 block mt-2 uppercase tracking-wide">
                {isArabic ? 'منذ دقيقة واحدة' : '1 MINUTE AGO'}
              </span>
            </div>
          </div>
        )}

        {platform === 'tiktok' && (
          <div className="bg-slate-950 text-white rounded-2xl overflow-hidden shadow-lg max-w-[260px] mx-auto w-full aspect-[9/16] relative flex flex-col justify-between border-4 border-slate-900 select-none">
            {/* TikTok Video / Background */}
            <div className="absolute inset-0 z-0">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="TikTok video preview"
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-black flex items-center justify-center">
                  <TikTokIcon className="w-16 h-16 opacity-30 text-white" />
                </div>
              )}
              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />
            </div>

            {/* Top Navigation Bar in TikTok */}
            <div className="relative z-10 pt-3 px-4 flex items-center justify-center text-xs font-medium text-slate-200 gap-4">
              <span className="opacity-70">{isArabic ? 'أتابعه' : 'Following'}</span>
              <span className="font-bold border-b-2 border-white pb-0.5">{isArabic ? 'لك' : 'For You'}</span>
            </div>

            {/* TikTok Right Action Column */}
            <div className="relative z-10 flex justify-end px-3">
              <div className="flex flex-col items-center gap-3.5 mb-4">
                {/* Avatar with Follow Plus */}
                <div className="relative">
                  <img
                    src={config.avatarUrl}
                    alt={config.handle}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    +
                  </div>
                </div>

                {/* Heart */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-white text-white" />
                  </div>
                  <span className="text-[10px] font-mono mt-0.5 tabular-nums">24.5K</span>
                </div>

                {/* Comments */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-mono mt-0.5 tabular-nums">842</span>
                </div>

                {/* Bookmark */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-mono mt-0.5 tabular-nums">1.9K</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-mono mt-0.5 tabular-nums">530</span>
                </div>

                {/* Vinyl Record */}
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center animate-spin">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Bottom Details (Handle, Caption, Sound) */}
            <div className="relative z-10 p-3 pt-0 text-right" dir="rtl">
              <h5 className="font-bold text-xs text-white font-mono mb-1">{config.handle}</h5>
              <p className="text-xs text-slate-100 line-clamp-3 leading-tight mb-2">
                {text || (isArabic ? 'وصف الفيديو والهاشتاقات في تيك توك...' : 'Video description and hashtags...')}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <Music className="w-3 h-3 shrink-0" />
                <span className="truncate">{isArabic ? 'الصوت الأصلي - ترند الرائج' : 'Original Sound - Viral Trend'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
