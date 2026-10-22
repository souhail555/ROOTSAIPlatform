import React, { useState, useRef } from 'react';
  import { PublishHistoryRecord, PlatformId, PlatformConfig } from '../types';
import { PlatformBadgeIcon } from './SocialIcons';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  FileText,
  Calendar,
  Send,
  XCircle,
  Timer,
  AlertCircle,
  ChevronDown,
  BookOpen,
  Eye,
    X,
    Copy,
    Download,
    Upload,
  } from 'lucide-react';

interface PublishHistoryProps {
  history: PublishHistoryRecord[];
  platformsConfig: Record<PlatformId, PlatformConfig>;
  onReusePost: (text: string, mediaUrl: string | null) => void;
  onPublishScheduledNow?: (id: string) => void;
  onCancelScheduled?: (id: string) => void;
  onImportData?: (records: PublishHistoryRecord[]) => void;
  lang: 'ar' | 'en';
}

export const PublishHistory: React.FC<PublishHistoryProps> = ({
  history,
  platformsConfig,
  onReusePost,
    onPublishScheduledNow,
    onCancelScheduled,
    onImportData,
    lang,
  }) => {
  const isArabic = lang === 'ar';
  const [filter, setFilter] = useState<'all' | 'published' | 'scheduled'>('all');
  const [viewingArticle, setViewingArticle] = useState<PublishHistoryRecord | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getWords = (text: string) => (text && text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);

  const handleCopyArticle = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const scheduledCount = history.filter((h) => h.isScheduled && h.status === 'scheduled').length;

  // Export all history + scheduled queue to a JSON file
  const handleExport = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roots-ai-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import history from a previously exported JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data.history) && data.history.length > 0) {
          onImportData(data.history as PublishHistoryRecord[]);
        } else {
          alert(isArabic ? 'الملف لا يحتوي على سجل صالح' : 'File contains no valid history');
        }
      } catch {
        alert(isArabic ? 'فشل قراءة الملف — تأكد أنه JSON صالح' : 'Failed to read file — invalid JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const publishedCount = history.filter((h) => !h.isScheduled || h.status === 'published').length;

  const filteredHistory = history.filter((item) => {
    if (filter === 'scheduled') return item.isScheduled && item.status === 'scheduled';
    if (filter === 'published') return !item.isScheduled || item.status === 'published';
    return true;
  });

  const formatScheduledTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeScheduledText = (dateStr?: string) => {
    if (!dateStr) return '';
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return isArabic ? 'حان موعد النشر' : 'Due now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return isArabic ? `متبقي ${days} يوم و ${hours % 24} ساعة` : `In ${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return isArabic ? `متبقي ${hours} ساعة و ${minutes} دقيقة` : `In ${hours}h ${minutes}m`;
    }
    return isArabic ? `متبقي ${minutes} دقيقة` : `In ${minutes}m`;
  };

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          {isArabic ? 'لا توجد منشورات في السجل بعد' : 'No Posts in History Yet'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isArabic
            ? 'بمجرد أن تقوم بنشر منشور فوري أو جدولته لتاريخ لاحق، سيظهر هنا مع الموعد وحالة التنفيذ.'
            : 'Once you publish or schedule a post, it will appear here with timing details and status.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40">
        {(() => {
          const totalPublished = history.filter((h) => !h.isScheduled || h.status === 'published');
          const totalTargets = totalPublished.reduce((acc, h) => acc + (h.targetPlatforms?.length || h.results.length || 0), 0);
          const perPlatform: Record<string, number> = {};
          totalPublished.forEach((h) =>
            (h.targetPlatforms?.length ? h.targetPlatforms : h.results.map((r) => r.platformId)).forEach((pid) => {
              perPlatform[pid] = (perPlatform[pid] || 0) + 1;
            })
          );
          const stats = [
            { label: isArabic ? 'منشورات' : 'Posts', value: totalPublished.length, cls: 'text-indigo-600' },
            { label: isArabic ? 'إجمالي النشر' : 'Total Publishes', value: totalTargets, cls: 'text-emerald-600' },
            { label: isArabic ? 'مجدولة' : 'Scheduled', value: scheduledCount, cls: 'text-amber-600' },
            { label: isArabic ? 'المنصة الأكثر' : 'Top Platform', value: perPlatform[Object.keys(perPlatform).sort((a, b) => perPlatform[b] - perPlatform[a])[0]] || 0, sub: Object.keys(perPlatform).sort((a, b) => perPlatform[b] - perPlatform[a])[0], cls: 'text-slate-800' },
          ];
          return stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center px-2 py-1.5 rounded-lg bg-white/70 border border-slate-100">
              <span className={`text-base font-extrabold tabular-nums ${s.cls}`}>
                {s.value}{s.sub ? <span className="text-[10px] font-bold ml-1 text-slate-500">({s.sub})</span> : null}
              </span>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5">{s.label}</span>
            </div>
          ));
        })()}
      </div>
      {/* Header and Filter Controls */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            {isArabic ? 'سجل المنشورات والجدولة' : 'Post History & Schedule Queue'}
          </h3>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? 'الكل' : 'All'} ({history.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'scheduled'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3 h-3 text-amber-600" />
            <span>{isArabic ? 'المجدولة' : 'Scheduled'}</span>
            <span className="font-mono tabular-nums">({scheduledCount})</span>
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'published'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isArabic ? 'المنشورة' : 'Published'}</span>
                  <span className="font-mono tabular-nums">({publishedCount})</span>
                </button>
              </div>

              {/* Export / Import controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                  title={isArabic ? 'تصدير السجل إلى ملف JSON' : 'Export history to JSON'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تصدير' : 'Export'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                  title={isArabic ? 'استيراد السجل من ملف JSON' : 'Import history from JSON'}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'استيراد' : 'Import'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
            </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isArabic ? 'لا توجد عناصر مطابقة للتصفية المحددة' : 'No posts match this filter'}
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isScheduledItem = item.isScheduled && item.status === 'scheduled';
            const isCancelled = item.status === 'cancelled';
            const targetList = item.targetPlatforms || item.results.map((r) => r.platformId);

            return (
              <div
                key={item.id}
                className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isScheduledItem ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.mediaUrl ? (
                    <img
                      src={item.mediaUrl}
                      alt="Post media"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-relaxed">
                      {item.postText}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                      {isScheduledItem ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded text-[10px]">
                            <Timer className="w-3 h-3" />
                            <span>{isArabic ? 'مجدول للنشر:' : 'Scheduled for:'}</span>
                            <span className="font-mono tabular-nums">{formatScheduledTime(item.scheduledFor)}</span>
                          </span>
                          <span className="text-amber-800 font-mono font-medium">
                            ({getRelativeScheduledText(item.scheduledFor)})
                          </span>
                        </>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>{isArabic ? 'تم إلغاء الجدولة' : 'Schedule Cancelled'}</span>
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isArabic ? 'تم النشر في:' : 'Published:'}</span>
                            <span className="font-mono tabular-nums">
                              {new Date(item.timestamp).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </span>
                        </>
                      )}

                      <span className="text-slate-300">·</span>

                      {/* Word count pill */}
                      {(() => {
                        const words = getWords(item.postText);
                        const isLong = words >= 4000;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 font-mono tabular-nums px-2 py-0.5 rounded text-[10px] ${
                              isLong
                                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            {isLong && <BookOpen className="w-3 h-3 text-emerald-700" />}
                            <span>{words.toLocaleString()} {isArabic ? 'كلمة' : 'words'}</span>
                          </span>
                        );
                      })()}

                      <span className="text-slate-300">·</span>

                      {/* Targeted Platforms Icons */}
                      <div className="flex items-center gap-1">
                        {targetList.map((pid) => {
                          const cfg = platformsConfig[pid];
                          const targetUrl = item.results.find((r) => r.platformId === pid)?.url || cfg?.pageUrl;
                          return targetUrl ? (
                            <a
                              key={pid}
                              href={targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={`${isArabic ? cfg?.nameAr || pid : cfg?.nameEn || pid}: ${targetUrl}`}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors inline-flex items-center"
                            >
                              <PlatformBadgeIcon platform={pid} className="w-3 h-3" />
                            </a>
                          ) : (
                            <span
                              key={pid}
                              title={`${isArabic ? cfg?.nameAr || pid : cfg?.nameEn || pid}`}
                              className="p-1 rounded bg-slate-100 text-slate-700"
                            >
                              <PlatformBadgeIcon platform={pid} className="w-3 h-3" />
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setViewingArticle(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    title={isArabic ? 'عرض وقراءة النص كاملاً' : 'Read full text'}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isArabic ? 'قراءة' : 'View'}</span>
                  </button>

                  {isScheduledItem ? (
                    <>
                      {onPublishScheduledNow && (
                        <button
                          type="button"
                          onClick={() => onPublishScheduledNow(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title={isArabic ? 'نشر هذا المنشور فوراً الآن' : 'Publish this post right now'}
                        >
                          <Send className="w-3 h-3" />
                          <span>{isArabic ? 'نشر الآن' : 'Publish Now'}</span>
                        </button>
                      )}
                      {onCancelScheduled && (
                        <button
                          type="button"
                          onClick={() => onCancelScheduled(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          title={isArabic ? 'إلغاء الجدولة' : 'Cancel schedule'}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{isArabic ? 'إلغاء' : 'Cancel'}</span>
                        </button>
                      )}
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onReusePost(item.postText, item.mediaUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isArabic ? 'إعادة الاستخدام' : 'Re-use'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Article Reader Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isArabic ? 'استعراض المحتوى والمقال' : 'Article & Post Viewer'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono tabular-nums font-semibold text-slate-700">
                      {getWords(viewingArticle.postText).toLocaleString()} {isArabic ? 'كلمة' : 'words'}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {viewingArticle.postText.length.toLocaleString()} {isArabic ? 'حرف' : 'chars'}
                    </span>
                    <span>·</span>
                    <span>
                      ~{Math.max(1, Math.ceil(getWords(viewingArticle.postText) / 200))} {isArabic ? 'دقيقة قراءة' : 'min read'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text font-sans">
              {viewingArticle.mediaUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-100">
                  <img
                    src={viewingArticle.mediaUrl}
                    alt="Article media"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              {viewingArticle.postText}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyArticle(viewingArticle.postText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNotice ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ النص كاملاً' : 'Copy Full Text')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReusePost(viewingArticle.postText, viewingArticle.mediaUrl);
                    setViewingArticle(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {isArabic ? 'نقل للمحرر' : 'Send to Composer'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewingArticle(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
