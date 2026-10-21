import React, { useState } from 'react';
import { PlatformId, PlatformConfig } from '../types';
import { PlatformBadgeIcon } from './SocialIcons';
import { Check, X, Link, Sliders, Webhook, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';

interface AccountsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Record<PlatformId, PlatformConfig>;
  onUpdatePlatform: (id: PlatformId, updates: Partial<PlatformConfig>) => void;
  webhookUrl: string;
  onUpdateWebhook: (url: string) => void;
  lang: 'ar' | 'en';
}

export const AccountsSettings: React.FC<AccountsSettingsProps> = ({
  isOpen,
  onClose,
  platforms,
  onUpdatePlatform,
  webhookUrl,
  onUpdateWebhook,
  lang,
}) => {
  if (!isOpen) return null;
  const isArabic = lang === 'ar';

  const [localWebhook, setLocalWebhook] = useState(webhookUrl);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveWebhook = () => {
    onUpdateWebhook(localWebhook);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isArabic ? 'إدارة قنوات النشر والحسابات' : 'Social Channels & Integrations'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'ضبط الحسابات المرتبطة وتخصيص أسماء الحسابات والربط البرمجي'
                  : 'Manage connected profiles, handles, and custom Webhook endpoints'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Platforms List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isArabic ? 'الحسابات النشطة للنشر التلقائي' : 'Active Accounts'}
            </h4>

            {(Object.keys(platforms) as PlatformId[]).map((pid) => {
              const item = platforms[pid];
              return (
                <div
                  key={pid}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.accentBg} ${item.badgeColor}`}>
                        <PlatformBadgeIcon platform={pid} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {isArabic ? item.nameAr : item.nameEn}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                              item.connected
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.connected
                              ? isArabic
                                ? 'متصل ومفعّل'
                                : 'Connected'
                              : isArabic
                              ? 'معطل'
                              : 'Disabled'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="text-xs text-slate-500">{isArabic ? 'المعرف:' : 'Handle:'}</label>
                          <input
                            type="text"
                            value={item.handle}
                            onChange={(e) => onUpdatePlatform(pid, { handle: e.target.value })}
                            className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdatePlatform(pid, { connected: !item.connected })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                        item.connected
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {item.connected
                        ? isArabic
                          ? 'فصل الحساب'
                          : 'Disconnect'
                        : isArabic
                        ? 'ربط وتفعيل'
                        : 'Connect'}
                    </button>
                  </div>

                  {/* Configured Page URL */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                    <label className="text-xs text-slate-500 shrink-0">
                      {isArabic ? 'رابط الصفحة:' : 'Page URL:'}
                    </label>
                    <input
                      type="url"
                      value={item.pageUrl || ''}
                      onChange={(e) => onUpdatePlatform(pid, { pageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 text-xs bg-white border border-slate-200 rounded px-2.5 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {item.pageUrl && (
                      <a
                        href={item.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                        title={isArabic ? 'فتح واختبار رابط الصفحة' : 'Open & test page URL'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Webhook / Automation Integration */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Webhook className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">
                {isArabic ? 'ربط Webhook خارجي اختياري (Zapier / Make / n8n)' : 'Optional Webhook (Zapier / Make / n8n)'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {isArabic
                ? 'إذا كنت تستخدم أتمتة خارجية عبر Zapier أو Make لنشر المنشور مباشرة في حساباتك الحقيقية، يمكنك وضع رابط الـ Webhook هنا وسيتم إرسال كل المنشورات إليه تلقائياً عند الضغط على "نشر".'
                : 'If you use Zapier, Make, or n8n to dispatch to real business APIs, input your webhook endpoint below.'}
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://hook.eu1.make.com/..."
                value={localWebhook}
                onChange={(e) => setLocalWebhook(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveWebhook}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                {savedNotification
                  ? isArabic
                    ? 'تم الحفظ!'
                    : 'Saved!'
                  : isArabic
                  ? 'حفظ الرابط'
                  : 'Save Hook'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isArabic ? 'بيانات النشر آمنة ومحمية' : 'End-to-end publish integrity'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            {isArabic ? 'إغلاق وحفظ' : 'Close & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
