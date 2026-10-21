import React from 'react';
import { PlatformId, PlatformConfig, PublishResultItem } from '../types';
import { PlatformBadgeIcon } from './SocialIcons';
import { CheckCircle2, ExternalLink, Copy, Share2, X, Sparkles } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: PublishResultItem[];
  platformsConfig: Record<PlatformId, PlatformConfig>;
  postText: string;
  lang: 'ar' | 'en';
  onCopyText: (text: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  results,
  platformsConfig,
  postText,
  lang,
  onCopyText,
}) => {
  if (!isOpen) return null;
  const isArabic = lang === 'ar';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'منشور جديد',
          text: postText,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      onCopyText(postText);
    }
  };

  const getDirectShareUrl = (platform: PlatformId, text: string, pageUrl?: string) => {
    switch (platform) {
      case 'twitter': {
        const fullEncoded = encodeURIComponent(text);
        if (fullEncoded.length < 1700) {
          return `https://twitter.com/intent/tweet?text=${fullEncoded}&url=${encodeURIComponent(pageUrl || 'https://x.com/ROOTS_AI_HEALTH')}`;
        }
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl || 'https://x.com/ROOTS_AI_HEALTH')}`;
      }
      case 'facebook': {
        const quoteText = text.length > 250 ? text.slice(0, 240) + '...' : text;
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl || 'https://www.facebook.com/profile.php?id=61595679084926')}&quote=${encodeURIComponent(quoteText)}`;
      }
      case 'instagram':
        return `https://www.instagram.com/`;
      case 'tiktok':
        return `https://www.tiktok.com/upload`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {isArabic ? 'تم النشر وتوجيه المنشور بنجاح!' : 'Published & Dispatched Successfully!'}
                </h3>
                {(() => {
                  const words = postText ? postText.trim().split(/\s+/).filter(Boolean).length : 0;
                  if (words >= 4000) {
                    return (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {isArabic ? `📑 مقال مطول (+4000 كلمة: ${words.toLocaleString()} كلمة)` : `Full Article (${words.toLocaleString()} words)`}
                      </span>
                    );
                  }
                  if (words >= 500) {
                    return (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {isArabic ? `${words.toLocaleString()} كلمة` : `${words.toLocaleString()} words`}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic
                  ? 'تم إرسال وتوجيه المحتوى لقنوات ROOTS AI HEALTH الرسمية المعتمدة'
                  : 'Post dispatched to official ROOTS AI HEALTH channels'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Platforms Status List */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-[380px]">
          {results.map((res) => {
            const cfg = platformsConfig[res.platformId];
            const directShareUrl = getDirectShareUrl(res.platformId, postText, cfg?.pageUrl);
            const officialPageUrl = cfg?.pageUrl || res.url;

            return (
              <div
                key={res.platformId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cfg?.accentBg || 'bg-slate-100'} ${cfg?.badgeColor || 'text-slate-700'}`}>
                    <PlatformBadgeIcon platform={res.platformId} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {isArabic ? cfg?.nameAr || res.platformId : cfg?.nameEn || res.platformId}
                      </span>
                      <span className="text-xs font-mono text-slate-500 truncate">
                        {cfg?.handle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isArabic ? 'تم التوجيه والتأكيد' : 'Dispatched'}
                      </span>
                      {res.platformId === 'twitter' && res.twitterMode === 'thread' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          🧵 {isArabic ? `ثريد منظم (${res.threadTweets?.length || 1} أجزاء)` : `Thread (${res.threadTweets?.length || 1} parts)`}
                        </span>
                      )}
                      {res.platformId === 'twitter' && res.twitterMode === 'long_post' && (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          📄 {isArabic ? 'مقال مطول كامل على X' : 'Full Long Post on X'}
                        </span>
                      )}
                      {officialPageUrl && (
                        <a
                          href={officialPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 truncate max-w-[220px]"
                          title={officialPageUrl}
                        >
                          <span className="truncate">{officialPageUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {officialPageUrl && (
                    <a
                      href={officialPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap"
                      title={isArabic ? 'فتح الصفحة الرسمية للحساب' : 'Open official page'}
                    >
                      <span>{isArabic ? 'زيارة الصفحة' : 'Open Page'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href={directShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap shadow-xs"
                    title={isArabic ? 'مشاركة المنشور فوراً' : 'Share post directly'}
                  >
                    <span>{isArabic ? 'مشاركة فورية' : 'Direct Share'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Quick Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{isArabic ? 'مشاركة عبر النظام' : 'System Share'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopyText(postText)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isArabic ? 'نسخ النص' : 'Copy Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              {isArabic ? 'تم والعودة للمحرر' : 'Done & Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
