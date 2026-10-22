/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  PlatformId,
  PlatformConfig,
  PublishResultItem,
  PublishHistoryRecord,
  TwitterPublishMode,
} from './types';
import { splitTextIntoTwitterThread } from './utils/twitterThread';
import { PlatformBadgeIcon, FacebookIcon, InstagramIcon, TikTokIcon, TwitterXIcon } from './components/SocialIcons';
import { PlatformPreview } from './components/PlatformPreview';
import { PublishModal } from './components/PublishModal';
import { AccountsSettings } from './components/AccountsSettings';
import { PublishHistory } from './components/PublishHistory';
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  RotateCcw,
  Sliders,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Hash,
  Trash2,
  Layers,
  Languages,
  Calendar,
  CalendarClock,
  Timer,
  Zap,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  BookOpen,
} from 'lucide-react';
import { generate4000WordMedicalArticle, getWordCount } from './data/sampleArticles';

// Default Sample Images generated for the applet
const SAMPLE_IMAGE_URL = '/src/assets/images/sample_post_photo_1792569404676.jpg';
const SAMPLE_AVATAR_URL = '/src/assets/images/sample_brand_avatar_1792569404258.jpg';

// Initial platform setup with official ROOTS AI HEALTH channels
const INITIAL_PLATFORMS: Record<PlatformId, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    nameAr: 'ROOTS AI HEALTH',
    nameEn: 'ROOTS AI HEALTH',
    handle: 'ROOTS AI HEALTH',
    pageUrl: 'https://www.facebook.com/profile.php?id=61595679084926',
    accountTypeAr: 'صفحة فيسبوك رسمية',
    accountTypeEn: 'Official Facebook Page',
    connected: true,
    avatarUrl: SAMPLE_AVATAR_URL,
    charLimit: 63206,
    badgeColor: 'text-blue-600',
    accentBg: 'bg-blue-50',
  },
  instagram: {
    id: 'instagram',
    nameAr: 'ROOTS AI HEALTH',
    nameEn: 'ROOTS AI HEALTH',
    handle: '@roots_ai_health',
    pageUrl: 'https://www.instagram.com/roots_ai_health/',
    accountTypeAr: 'حساب انستقرام أعمال',
    accountTypeEn: 'Instagram Business Account',
    connected: true,
    avatarUrl: SAMPLE_AVATAR_URL,
    charLimit: 2200,
    badgeColor: 'text-pink-600',
    accentBg: 'bg-pink-50',
  },
  tiktok: {
    id: 'tiktok',
    nameAr: 'ROOTS AI HEALTH',
    nameEn: 'ROOTS AI HEALTH',
    handle: '@roots_ai_health',
    pageUrl: 'https://www.tiktok.com/@roots_ai_health?lang=en-GB',
    accountTypeAr: 'حساب تيك توك موثق',
    accountTypeEn: 'Creator Account',
    connected: true,
    avatarUrl: SAMPLE_AVATAR_URL,
    charLimit: 2200,
    badgeColor: 'text-slate-900',
    accentBg: 'bg-slate-100',
  },
  twitter: {
    id: 'twitter',
    nameAr: 'ROOTS AI HEALTH',
    nameEn: 'ROOTS AI HEALTH',
    handle: '@ROOTS_AI_HEALTH',
    pageUrl: 'https://x.com/ROOTS_AI_HEALTH',
    accountTypeAr: 'حساب موثق على X (مقال مطول + ثريد)',
    accountTypeEn: 'Verified on X (Long Post & Thread)',
    connected: true,
    avatarUrl: SAMPLE_AVATAR_URL,
    charLimit: 25000,
    badgeColor: 'text-slate-900',
    accentBg: 'bg-slate-100',
  },
};

const PRESET_TEMPLATES = [
  {
    titleAr: '📑 دراسة وبحث طبي شامل (+4000 كلمة)',
    titleEn: '📑 Comprehensive Study (+4,000 words)',
    isGenerator: true,
    text: '',
  },
  {
    titleAr: '🌿 إعلان رسمي - ROOTS AI HEALTH',
    titleEn: '🌿 Official Health AI Announcement',
    text: 'يسرّنا في ROOTS AI HEALTH الإعلان عن حلولنا الذكية المبتكرة في الذكاء الاصطناعي للرعاية الصحية. نسعى لإعادة صياغة تجربة الصحة الرقمية بكفاءة ودقة 🩺✨ تابعونا للمزيد.',
  },
  {
    titleAr: '💡 رؤية ونصيحة صحية رقمية',
    titleEn: '💡 Digital Health Insight',
    text: 'الذكاء الاصطناعي في الطب ليس بديلاً عن الطبيب، بل قوة مضاعفة تدعم التشخيص الدقيق وتسرّع وصول الرعاية لمن يحتاجها في الوقت المناسب.',
  },
  {
    titleAr: '🚀 إطلاق تحديث أو ميزة',
    titleEn: '🚀 Feature Update',
    text: 'تحديث جديد ومبتكر من ROOTS AI HEALTH يمنحكم سرعة أكبر وتكاملاً ذكياً في تحليلات الصحة الرقمية. تفقدوا التفاصيل وأخبرونا برأيكم عبر التعليقات!',
  },
  {
    titleAr: '💬 سؤال تفاعلي للمجتمع',
    titleEn: '💬 Community Question',
    text: 'ما هو أكبر تحدٍ ترون أن تقنيات الذكاء الاصطناعي يمكن أن تساهم في حلّه بقطاع الرعاية الصحية اليوم؟ شاركونا آراءكم القيّمة في التعليقات 👇',
  },
];

const SUGGESTED_HASHTAGS = [
  '#ROOTS_AI_HEALTH',
  '#الذكاء_الاصطناعي',
  '#صحة_رقمية',
  '#HealthTech',
  '#AIinHealthcare',
  '#صحة',
  '#ابتكار',
];

// Helper to format Date to datetime-local string (YYYY-MM-DDTHH:mm)
function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isArabic = lang === 'ar';

  // State with ROOTS AI HEALTH configurations
  const [platforms, setPlatforms] = useState<Record<PlatformId, PlatformConfig>>(() => {
    try {
      const saved = localStorage.getItem('roots_ai_platforms_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.facebook?.pageUrl && parsed?.twitter?.pageUrl) {
          return parsed;
        }
      }
    } catch (_) {}
    return INITIAL_PLATFORMS;
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([
    'facebook',
    'instagram',
    'tiktok',
    'twitter',
  ]);

  const [postText, setPostText] = useState(
    'يسرّنا في ROOTS AI HEALTH مشاركتكم أحدث رؤانا وحلولنا في توظيف الذكاء الاصطناعي للارتقاء بالرعاية الصحية وتقديم خدمات رقمية ذكية ومتطورة 🌿🩺 تابعونا لمزيد من الأخبار والتحديثات!'
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(SAMPLE_IMAGE_URL);
  const [linkUrl, setLinkUrl] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [customizedTexts, setCustomizedTexts] = useState<Partial<Record<PlatformId, string>>>({});
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<PlatformId>('facebook');
  const [usePerPlatformCustomization, setUsePerPlatformCustomization] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [twitterPublishMode, setTwitterPublishMode] = useState<TwitterPublishMode>('long_post');

  // Scheduling State
  const [publishMode, setPublishMode] = useState<'immediate' | 'schedule'>('immediate');
  const [repeatMode, setRepeatMode] = useState<'none' | 'daily' | 'weekly'>('none');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(() => {
    // Default to tomorrow at 10:00 AM
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return toDatetimeLocalString(d);
  });

  // Modals & Panels
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<string>('');
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResultItem[]>([]);
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('editor');

  // History list with sample data
  const [history, setHistory] = useState<PublishHistoryRecord[]>([
    {
      id: 'sched_demo_1',
      postText: 'رؤية ROOTS AI HEALTH لمستقبل الرعاية الصحية: كيف يسهم الذكاء الاصطناعي في تمكين الأطباء وتقديم رعاية وقائية استباقية 🩺✨',
      mediaUrl: SAMPLE_IMAGE_URL,
      timestamp: new Date().toISOString(),
      results: [],
      isScheduled: true,
      scheduledFor: new Date(Date.now() + 86400000 * 1.5).toISOString(),
      status: 'scheduled',
      targetPlatforms: ['facebook', 'instagram', 'twitter', 'tiktok'],
    },
    {
      id: 'hist_1',
      postText: 'مرحباً بكم في ROOTS AI HEALTH! نسعد بتواجدكم معنا ونتطلع لمشاركتكم أحدث الابتكارات في الصحة الرقمية والذكاء الاصطناعي.',
      mediaUrl: SAMPLE_IMAGE_URL,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      results: [
        { platformId: 'facebook', status: 'success', publishedAt: new Date().toISOString(), postId: 'fb_1', url: 'https://www.facebook.com/profile.php?id=61595679084926', pageUrl: 'https://www.facebook.com/profile.php?id=61595679084926' },
        { platformId: 'twitter', status: 'success', publishedAt: new Date().toISOString(), postId: 'tw_1', url: 'https://x.com/ROOTS_AI_HEALTH', pageUrl: 'https://x.com/ROOTS_AI_HEALTH' },
        { platformId: 'instagram', status: 'success', publishedAt: new Date().toISOString(), postId: 'ig_1', url: 'https://www.instagram.com/roots_ai_health/', pageUrl: 'https://www.instagram.com/roots_ai_health/' },
        { platformId: 'tiktok', status: 'success', publishedAt: new Date().toISOString(), postId: 'tt_1', url: 'https://www.tiktok.com/@roots_ai_health?lang=en-GB', pageUrl: 'https://www.tiktok.com/@roots_ai_health?lang=en-GB' },
      ],
      isScheduled: false,
      status: 'published',
      targetPlatforms: ['facebook', 'instagram', 'twitter', 'tiktok'],
    },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle platform selection
  const togglePlatform = (id: PlatformId) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) {
        showToast(isArabic ? 'يجب تحديد منصة واحدة على الأقل' : 'Select at least one platform');
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  // Select all
  const selectAllPlatforms = () => {
    setSelectedPlatforms(['facebook', 'instagram', 'tiktok', 'twitter']);
  };

  // Add hashtag to text
  const addHashtag = (tag: string) => {
    if (!postText.includes(tag)) {
      setPostText((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  // File upload handler for media
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result as string);
        showToast(isArabic ? 'تم إرفاق الصورة بنجاح' : 'Image attached successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Text file import handler for long articles (> 4,000 words)
  const handleTextFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setPostText(text);
        setUsePerPlatformCustomization(false);
        const words = getWordCount(text);
        showToast(
          isArabic
            ? `📑 تم استيراد مقال كامل بنجاح (${words.toLocaleString()} كلمة)!`
            : `Imported document with ${words.toLocaleString()} words!`
        );
      };
      reader.readAsText(file);
    }
  };

  // Quick Schedule Preset
  const setQuickSchedule = (type: 'plus1h' | 'tomorrow10am' | 'tomorrow6pm' | 'weekend') => {
    const d = new Date();
    if (type === 'plus1h') {
      d.setHours(d.getHours() + 1);
    } else if (type === 'tomorrow10am') {
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
    } else if (type === 'tomorrow6pm') {
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
    } else if (type === 'weekend') {
      // Find upcoming Friday or Saturday
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(12, 0, 0, 0);
    }
    setScheduledDateTime(toDatetimeLocalString(d));
    setPublishMode('schedule');
  };

  // AI Adapt Handler
  const handleAIAdapt = async () => {
    if (!postText.trim()) {
      showToast(isArabic ? 'الرجاء إدخال نص المنشور أولاً' : 'Please enter post text first');
      return;
    }

    setIsAdapting(true);
    try {
      const res = await fetch('/api/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: postText,
          targetLanguage: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.adapted) {
        setCustomizedTexts(data.adapted);
        setUsePerPlatformCustomization(true);
        showToast(
          isArabic
            ? 'تم تحسين وتفصيل المنشور لكل منصة بالذكاء الاصطناعي!'
            : 'AI successfully adapted your post for each platform!'
        );
      } else {
        throw new Error('Adaptation failed');
      }
    } catch {
      // Fallback
      setCustomizedTexts({
        twitter: postText.slice(0, 240) + '... #تحديث',
        facebook: `${postText}\n\nشاركونا آراءكم في التعليقات! 👇`,
        instagram: `${postText}\n.\n.\n#اكسبلور #ترند #محتوى #جديد`,
        tiktok: `شاهد الآن! 🔥 ${postText.slice(0, 100)} #fyp #viral`,
      });
      setUsePerPlatformCustomization(true);
      showToast(isArabic ? 'تم تطبيق صيغ مخصصة لكل منصة' : 'Applied custom formats for platforms');
    } finally {
      setIsAdapting(false);
    }
  };

  // Quick Summarize for Twitter only
  const handleQuickSummarizeForTwitter = () => {
    const textToSummarize = postText.trim();
    if (!textToSummarize) return;
    const summary = textToSummarize.length > 240
      ? textToSummarize.slice(0, 220) + '... 🧵 [المقال الكامل بالرابط]\n#ROOTS_AI_HEALTH'
      : textToSummarize;
    setCustomizedTexts((prev) => ({
      ...prev,
      twitter: summary,
    }));
    setUsePerPlatformCustomization(true);
    setActivePreviewPlatform('twitter');
    showToast(isArabic ? 'تم تجهيز ملخص ذكي لتويتر مع الاحتفاظ بالمقال كاملاً لبقية المنصات' : 'Created Twitter summary while keeping full article');
  };

  // Immediate Publish Action
  const handleOneClickPublish = async () => {
    if (!postText.trim() && !mediaUrl) {
      showToast(isArabic ? 'الرجاء إدخال نص أو صورة للمنشور' : 'Please provide text or media');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast(isArabic ? 'الرجاء تحديد منصة واحدة على الأقل' : 'Please select at least one platform');
      return;
    }

    // Auto-prepare customized text for Twitter based on chosen mode
    const finalCustomized = { ...customizedTexts };
    let threadTweetsForTwitter: string[] = [];

    if (selectedPlatforms.includes('twitter')) {
      const activeText = (usePerPlatformCustomization && customizedTexts.twitter) || postText;
      if (twitterPublishMode === 'thread') {
        threadTweetsForTwitter = splitTextIntoTwitterThread(activeText);
        finalCustomized.twitter = threadTweetsForTwitter[0] || activeText;
      } else if (twitterPublishMode === 'long_post') {
        // Send the FULL text for X Long-form without any truncation!
        finalCustomized.twitter = activeText;
      } else if (twitterPublishMode === 'summary') {
        if (!customizedTexts.twitter) {
          finalCustomized.twitter = activeText.slice(0, 230) + '... 🧵 [المقال الكامل بالرابط]\n\n🔗 https://x.com/ROOTS_AI_HEALTH';
        }
      }
    }

    setIsPublishing(true);
    setPublishProgress(isArabic ? 'جاري تجهيز المنشور والاتصال بالمنصات...' : 'Connecting to platforms...');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          content: postText,
          customizedTexts: finalCustomized,
          mediaUrl,
          webhookUrl,
          accountsConfig: platforms,
          twitterMode: twitterPublishMode,
          threadTweets: threadTweetsForTwitter,
        }),
      });

      const data = await res.json();

      if (data.success && data.results) {
        const resultsArray: PublishResultItem[] = selectedPlatforms.map((p) => {
          const item = data.results[p];
          const cfg = platforms[p];
          return {
            platformId: p,
            status: 'success',
            publishedAt: item?.timestamp || new Date().toISOString(),
            postId: item?.postId || `post_${Date.now()}`,
            url: item?.url || cfg?.pageUrl || '',
            pageUrl: cfg?.pageUrl || '',
            twitterMode: p === 'twitter' ? twitterPublishMode : undefined,
            threadTweets: p === 'twitter' && twitterPublishMode === 'thread' ? threadTweetsForTwitter : undefined,
          };
        });

        setPublishResults(resultsArray);

        // Add to history
        const newRecord: PublishHistoryRecord = {
          id: `hist_${Date.now()}`,
          postText: postText,
          mediaUrl: mediaUrl,
          timestamp: new Date().toISOString(),
          results: resultsArray,
          isScheduled: false,
          status: 'published',
          targetPlatforms: selectedPlatforms,
          twitterMode: selectedPlatforms.includes('twitter') ? twitterPublishMode : undefined,
          threadTweets: selectedPlatforms.includes('twitter') && twitterPublishMode === 'thread' ? threadTweetsForTwitter : undefined,
        };
        setHistory((prev) => [newRecord, ...prev]);

        // Celebrate with confetti
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#ec4899', '#06b6d4', '#10b981'],
        });

        setPublishModalOpen(true);
      } else {
        throw new Error('Publishing failed');
      }
    } catch {
      showToast(isArabic ? 'حدث خطأ أثناء محاولة النشر' : 'An error occurred during publishing');
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  // Schedule Post Action
  const handleSchedulePost = async () => {
    if (!postText.trim() && !mediaUrl) {
      showToast(isArabic ? 'الرجاء إدخال نص أو صورة للمنشور' : 'Please provide text or media');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast(isArabic ? 'الرجاء تحديد منصة واحدة على الأقل' : 'Please select at least one platform');
      return;
    }

    const scheduledDateObj = new Date(scheduledDateTime);
    if (isNaN(scheduledDateObj.getTime()) || scheduledDateObj.getTime() <= Date.now()) {
      showToast(isArabic ? 'الرجاء اختيار تاريخ ووقت مستقبلي للجدولة' : 'Select a future date and time');
      return;
    }

    const finalCustomized = { ...customizedTexts };
    let threadTweetsForTwitter: string[] = [];

    if (selectedPlatforms.includes('twitter')) {
      const activeText = (usePerPlatformCustomization && customizedTexts.twitter) || postText;
      if (twitterPublishMode === 'thread') {
        threadTweetsForTwitter = splitTextIntoTwitterThread(activeText);
        finalCustomized.twitter = threadTweetsForTwitter[0] || activeText;
      } else if (twitterPublishMode === 'long_post') {
        finalCustomized.twitter = activeText;
      } else if (twitterPublishMode === 'summary') {
        if (!customizedTexts.twitter) {
          finalCustomized.twitter = activeText.slice(0, 230) + '... 🧵 [المقال الكامل بالرابط]\n\n🔗 https://x.com/ROOTS_AI_HEALTH';
        }
      }
    }

    setIsPublishing(true);
    setPublishProgress(isArabic ? 'جاري جدولة المنشور في قائمة الانتظار...' : 'Scheduling post...');

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          content: postText,
          customizedTexts: finalCustomized,
          mediaUrl,
          scheduledFor: scheduledDateObj.toISOString(),
          repeatMode,
          webhookUrl,
          accountsConfig: platforms,
          twitterMode: twitterPublishMode,
          threadTweets: threadTweetsForTwitter,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newScheduledItem: PublishHistoryRecord = {
          id: data.scheduleId || `sched_${Date.now()}`,
          postText,
          mediaUrl,
          timestamp: new Date().toISOString(),
          results: [],
          isScheduled: true,
          scheduledFor: scheduledDateObj.toISOString(),
          status: 'scheduled',
          targetPlatforms: selectedPlatforms,
          twitterMode: selectedPlatforms.includes('twitter') ? twitterPublishMode : undefined,
          threadTweets: selectedPlatforms.includes('twitter') && twitterPublishMode === 'thread' ? threadTweetsForTwitter : undefined,
        };

        setHistory((prev) => [newScheduledItem, ...prev]);

        showToast(
          isArabic
            ? `📅 تم جدولة المنشور بنجاح ليوم ${scheduledDateObj.toLocaleDateString('ar-SA')} الساعة ${scheduledDateObj.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`
            : `📅 Post scheduled for ${scheduledDateObj.toLocaleString()}`
        );

        // Switch to history tab to see the queued item
        setActiveTab('history');
      } else {
        throw new Error('Scheduling failed');
      }
    } catch {
      showToast(isArabic ? 'فشلت جدولة المنشور' : 'Scheduling failed');
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  // Publish a scheduled item right away
  const handlePublishScheduledNow = async (id: string) => {
    const item = history.find((h) => h.id === id);
    if (!item) return;

    showToast(isArabic ? 'جاري تنفيذ النشر الفوري...' : 'Publishing immediately...');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: item.targetPlatforms || ['facebook', 'instagram', 'tiktok', 'twitter'],
          content: item.postText,
          mediaUrl: item.mediaUrl,
          webhookUrl,
          accountsConfig: platforms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const resultsArray: PublishResultItem[] = (item.targetPlatforms || ['facebook', 'instagram', 'tiktok', 'twitter']).map((p) => ({
          platformId: p,
          status: 'success',
          publishedAt: new Date().toISOString(),
          postId: `post_${Date.now()}`,
          url: data.results?.[p]?.url || platforms[p]?.pageUrl || '',
          pageUrl: platforms[p]?.pageUrl || '',
        }));

        setHistory((prev) =>
          prev.map((h) =>
            h.id === id
              ? {
                  ...h,
                  status: 'published',
                  results: resultsArray,
                  timestamp: new Date().toISOString(),
                }
              : h
          )
        );

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        showToast(isArabic ? 'تم نشر المنشور المجدول بنجاح!' : 'Scheduled post published successfully!');
      }
    } catch {
      showToast(isArabic ? 'تعذر نشر المنشور المجدول' : 'Failed to publish scheduled post');
    }
  };

  // Cancel scheduled post
  const handleCancelScheduled = (id: string) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'cancelled' } : h))
    );
    showToast(isArabic ? 'تم إلغاء موعد المنشور المجدول' : 'Scheduled post cancelled');
  };

  const currentPlatformText = (pid: PlatformId) => {
    if (usePerPlatformCustomization && customizedTexts[pid]) {
      return customizedTexts[pid] || '';
    }
    return postText;
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Exactly 3 Zones separated by gap-8
          Zone 1: Brand title, one line
          Zone 2: 4-5 nav links, 1-2 word labels, single-line
          Zone 3: 1 primary action
      */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            🌿
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 leading-tight">
              ROOTS AI HEALTH
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold tracking-wide">
              {isArabic ? 'منصة النشر الموحد الذكي' : 'Multi-Publish Broadcast Hub'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('editor')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'editor' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1' : 'hover:text-slate-900'
            }`}
          >
            {isArabic ? 'المحرر والجدولة' : 'Composer & Schedule'}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'preview' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1' : 'hover:text-slate-900'
            }`}
          >
            {isArabic ? 'المعاينة المباشرة' : 'Live Previews'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1' : 'hover:text-slate-900'
            }`}
          >
            <span>{isArabic ? 'سجل المنشورات والجدولة' : 'History & Queue'}</span>
            {history.filter((h) => h.isScheduled && h.status === 'scheduled').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setAccountsModalOpen(true)}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إدارة الحسابات' : 'Accounts'}</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLang(isArabic ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isArabic ? 'English' : 'عربي'}</span>
          </button>

          <button
            onClick={publishMode === 'immediate' ? handleOneClickPublish : handleSchedulePost}
            disabled={isPublishing}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0 disabled:opacity-50 ${
              publishMode === 'schedule'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isPublishing ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : publishMode === 'schedule' ? (
              <CalendarClock className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>
              {isPublishing
                ? isArabic
                  ? 'جاري التنفيذ...'
                  : 'Processing...'
                : publishMode === 'schedule'
                ? isArabic
                  ? 'جدولة المنشور'
                  : 'Schedule Post'
                : isArabic
                ? 'نشر فوري للجميع'
                : 'Publish All Now'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isArabic ? 'المحرر' : 'Composer'}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isArabic ? 'المعاينة' : 'Preview'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isArabic ? 'السجل والجدولة' : 'History & Queue'}
            </button>
          </div>
          <button
            onClick={() => setAccountsModalOpen(true)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* ROOTS AI HEALTH Channels Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-lg">
                🌿
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                    {isArabic ? 'قنوات ROOTS AI HEALTH الرسمية' : 'ROOTS AI HEALTH Official Channels'}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isArabic ? '4 قنوات متصلة ومجهزة للنشر الفوري' : '4 Channels Connected & Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {isArabic
                    ? 'تم ربط روابط صفحاتك الرسمية الأربعة (فيسبوك، تويتر X، انستقرام، تيك توك) لتوجيه ونشر منشوراتك بضغطة زر واحدة.'
                    : 'All 4 official page links are mapped and active for one-click simultaneous broadcasting.'}
                </p>
              </div>
            </div>

            {/* Quick Link Chips to Test Each Page */}
            <div className="flex flex-wrap items-center gap-2">
              {(['facebook', 'twitter', 'instagram', 'tiktok'] as PlatformId[]).map((pid) => {
                const cfg = platforms[pid];
                if (!cfg?.pageUrl) return null;
                return (
                  <a
                    key={pid}
                    href={cfg.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-slate-100 transition-all hover:scale-[1.02]"
                    title={`${isArabic ? 'فتح صفحة' : 'Open'} ${cfg.handle}`}
                  >
                    <PlatformBadgeIcon platform={pid} className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{cfg.handle}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                );
              })}
              <button
                type="button"
                onClick={() => setAccountsModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إدارة الروابط' : 'Manage Links'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'history' ? (
          <PublishHistory
            history={history}
            platformsConfig={platforms}
            onReusePost={(text, media) => {
              setPostText(text);
              setMediaUrl(media);
              setActiveTab('editor');
              showToast(isArabic ? 'تم نقل المنشور إلى المحرر' : 'Post transferred to composer');
            }}
            onPublishScheduledNow={handlePublishScheduledNow}
            onCancelScheduled={handleCancelScheduled}
            lang={lang}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Post Composer & Multi-platform Channels (7 cols) */}
            <div className={`space-y-6 ${activeTab === 'preview' ? 'hidden lg:block lg:col-span-6' : 'lg:col-span-7'}`}>
              {/* Target Platforms Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {isArabic ? 'وجهات النشر المتزامنة' : 'Publish Destinations'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllPlatforms}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {isArabic ? 'تحديد الكل' : 'Select All'}
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      onClick={() => setAccountsModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      {isArabic ? 'تعديل الحسابات' : 'Edit Handles'}
                    </button>
                  </div>
                </div>

                {/* 4 Interactive Platform Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['facebook', 'instagram', 'tiktok', 'twitter'] as PlatformId[]).map((pid) => {
                    const cfg = platforms[pid];
                    const isSelected = selectedPlatforms.includes(pid);

                    return (
                      <div
                        key={pid}
                        className={`flex flex-col p-3 rounded-xl border text-right transition-all relative ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <button
                            type="button"
                            onClick={() => togglePlatform(pid)}
                            className="flex items-center gap-1.5 cursor-pointer text-left rtl:text-right"
                          >
                            <PlatformBadgeIcon platform={pid} className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePlatform(pid)}
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePlatform(pid)}
                          className="text-right cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-900 block">
                            {isArabic ? cfg.nameAr : cfg.nameEn}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono truncate block max-w-full">
                            {cfg.handle}
                          </span>
                        </button>

                        {cfg.pageUrl && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <a
                              href={cfg.pageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate font-medium"
                              title={cfg.pageUrl}
                            >
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{isArabic ? 'زيارة الرابط' : 'Visit Link'}</span>
                            </a>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={isArabic ? 'متصل' : 'Connected'} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Composer Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                {/* Header with AI Adapt, Editor Expansion & Per-Platform Switch */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {isArabic ? 'محتوى المنشور والمقال' : 'Post & Article Content'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {isArabic ? 'سعة مفتوحة (+4000 كلمة)' : 'Supports 4,000+ words'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                      title={isArabic ? 'استيراد مقال طويل من ملف نصي (.txt, .md)' : 'Import article (.txt, .md)'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'استيراد مقال (+4000 كلمة)' : 'Import File'}</span>
                      <input
                        type="file"
                        accept=".txt,.md,.text"
                        onChange={handleTextFileImport}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={isEditorExpanded ? (isArabic ? 'تصغير المحرر' : 'Compact view') : (isArabic ? 'تكبير مساحة الكتابة' : 'Expand editor')}
                    >
                      {isEditorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>{isEditorExpanded ? (isArabic ? 'تصغير' : 'Compact') : (isArabic ? 'تكبير المحرر' : 'Expand')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAIAdapt}
                      disabled={isAdapting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isAdapting
                          ? isArabic
                            ? 'جاري التحسين...'
                            : 'Adapting...'
                          : isArabic
                          ? 'تحسين ذكي للمنصات (AI)'
                          : 'AI Adapt'}
                      </span>
                    </button>

                    {usePerPlatformCustomization && (
                      <button
                        type="button"
                        onClick={() => setUsePerPlatformCustomization(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        {isArabic ? 'إلغاء التخصيص' : 'Reset Uniform'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-Platform Customization Selector Tabs (if AI adapted or custom mode is on) */}
                {usePerPlatformCustomization && (
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                    {(['facebook', 'instagram', 'tiktok', 'twitter'] as PlatformId[]).map((pid) => (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setActivePreviewPlatform(pid)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          activePreviewPlatform === pid
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <PlatformBadgeIcon platform={pid} className="w-3.5 h-3.5" />
                        <span>{isArabic ? platforms[pid].nameAr : platforms[pid].nameEn}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Textarea and Word/Char Statistics Bar */}
                {(() => {
                  const currentText = usePerPlatformCustomization
                    ? (customizedTexts[activePreviewPlatform] || '')
                    : postText;
                  const currentWordCount = getWordCount(currentText);
                  const currentCharCount = currentText.length;
                  const readingTimeMinutes = Math.max(1, Math.ceil(currentWordCount / 200));

                  return (
                    <div className="space-y-2">
                      <div className="relative">
                        <textarea
                          rows={isEditorExpanded ? 18 : 8}
                          value={currentText}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (usePerPlatformCustomization) {
                              setCustomizedTexts((prev) => ({
                                ...prev,
                                [activePreviewPlatform]: val,
                              }));
                            } else {
                              setPostText(val);
                            }
                          }}
                          placeholder={
                            isArabic
                              ? 'اكتب أو الصق مقالك أو منشورك هنا... يدعم المقالات الطويلة والتقارير الطبية لأكثر من 4000 كلمة بكل كفاءة وسلاسة!'
                              : 'Write or paste your article here... Fully supports long-form content over 4,000 words smoothly!'
                          }
                          className={`w-full text-sm text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed placeholder:text-slate-400 font-sans resize-y ${
                            isEditorExpanded ? 'min-h-[380px]' : 'min-h-[190px]'
                          }`}
                        />

                        {/* Character & Word Counter Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mt-2 px-1 gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono tabular-nums font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {currentWordCount.toLocaleString()} {isArabic ? 'كلمة' : 'words'}
                            </span>
                            <span className="font-mono tabular-nums text-slate-500">
                              {currentCharCount.toLocaleString()} {isArabic ? 'حرف' : 'chars'}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">
                              {isArabic ? `~${readingTimeMinutes} دقيقة قراءة` : `~${readingTimeMinutes} min read`}
                            </span>

                            {currentWordCount >= 4000 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isArabic ? 'مقال مطول (+4,000 كلمة)' : 'Full Article (4,000+ words)'}</span>
                              </span>
                            ) : currentWordCount >= 1000 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                <span>{isArabic ? 'مقال موسع (+1,000 كلمة)' : 'Extended Post'}</span>
                              </span>
                            ) : null}

                            {selectedPlatforms.includes('twitter') && currentCharCount > 280 && (
                              <button
                                type="button"
                                onClick={handleQuickSummarizeForTwitter}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                title={isArabic ? 'توليد ملخص ذكي لتويتر مع الاحتفاظ بالمقال كاملاً لبقية المنصات' : 'Generate Twitter summary'}
                              >
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>{isArabic ? 'ملخص لتويتر فقط' : 'Twitter Summary'}</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setPostText('');
                              setCustomizedTexts({});
                            }}
                            className="text-slate-400 hover:text-red-600 transition-colors self-end sm:self-auto flex items-center gap-1 cursor-pointer"
                            title={isArabic ? 'مسح النص' : 'Clear text'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'مسح' : 'Clear'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Preset Starter Templates */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isArabic ? 'نماذج جاهزة وسريعة:' : 'Quick Templates:'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {isArabic ? 'يدعم المقالات الطويلة حتى 10,000 كلمة' : 'Supports long articles up to 10k words'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (tmpl.isGenerator) {
                            const longArticle = generate4000WordMedicalArticle();
                            setPostText(longArticle);
                            setUsePerPlatformCustomization(false);
                            showToast(
                              isArabic
                                ? `📑 تم تحميل دراسة وبحث شامل (+4000 كلمة: ${getWordCount(longArticle).toLocaleString()} كلمة)!`
                                : 'Loaded comprehensive medical study with 4,000+ words!'
                            );
                          } else {
                            setPostText(tmpl.text);
                            setUsePerPlatformCustomization(false);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                          tmpl.isGenerator
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 ring-1 ring-emerald-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isArabic ? tmpl.titleAr : tmpl.titleEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Hashtags */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>{isArabic ? 'وسوم مقترحة للتفاعل السريع:' : 'Trending Hashtags:'}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_HASHTAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addHashtag(tag)}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Attachment Section */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>{isArabic ? 'الصورة أو الفيديو المرفق' : 'Attached Media'}</span>
                    </label>

                    {mediaUrl && (
                      <button
                        type="button"
                        onClick={() => setMediaUrl(null)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isArabic ? 'إزالة الصورة' : 'Remove media'}</span>
                      </button>
                    )}
                  </div>

                  {mediaUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 group">
                      <img
                        src={mediaUrl}
                        alt="Attached media"
                        className="w-full h-48 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100">
                          {isArabic ? 'تغيير الصورة' : 'Replace Image'}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-700 block">
                          {isArabic ? 'انقر لرفع صورة أو اسحبها هنا' : 'Upload custom media'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isArabic ? 'يدعم PNG, JPG, MP4' : 'Supports PNG, JPG, MP4'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setMediaUrl(SAMPLE_IMAGE_URL)}
                        className="sm:w-44 border border-slate-200 hover:border-indigo-300 bg-white rounded-xl p-3 text-right flex flex-col justify-center transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800">
                          {isArabic ? 'استخدام صورة تجريبية' : 'Use Sample Photo'}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          {isArabic ? 'صورة قهوة ومكان عمل احترافية' : 'Professional cafe shot'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional Web Link */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isArabic ? 'رابط اختياري (Web Link)' : 'Optional Link'}</span>
                  </div>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/promo"
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* SCHEDULE VS IMMEDIATE PUBLISH TOGGLE */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CalendarClock className="w-4 h-4 text-indigo-600" />
                      <span>{isArabic ? 'توقيت وتاريخ النشر' : 'Publish Timing'}</span>
                    </span>

                    {/* Mode selector */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPublishMode('immediate')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                          publishMode === 'immediate'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'نشر فوري الآن' : 'Publish Now'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishMode('schedule')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                          publishMode === 'schedule'
                            ? 'bg-white text-amber-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'جدولة لموعد لاحق' : 'Schedule Later'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Date/Time Picker Card */}
                  {publishMode === 'schedule' && (
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 animate-in fade-in duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-amber-600" />
                          <span>{isArabic ? 'اختر موعد النشر التلقائي:' : 'Select delivery date & time:'}</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledDateTime}
                          min={toDatetimeLocalString(new Date())}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="text-xs font-mono bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                        />
                      </div>

                      {/* Quick Shortcuts for Scheduling */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/60">
                        <span className="text-[11px] text-amber-800 font-medium">
                          {isArabic ? 'مواعيد سريعة مقترحة:' : 'Quick Presets:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickSchedule('plus1h')}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                        >
                          {isArabic ? '+ بعد ساعة' : '+1 Hour'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickSchedule('tomorrow10am')}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                        >
                          {isArabic ? 'غداً 10:00 ص' : 'Tomorrow 10am'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickSchedule('tomorrow6pm')}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                        >
                          {isArabic ? 'غداً 06:00 م' : 'Tomorrow 6pm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickSchedule('weekend')}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                        >
                          {isArabic ? 'عطلة نهاية الأسبوع' : 'Weekend'}
                        </button>
                      </div>

                      {/* Live Date Confirmation Preview */}
                      {scheduledDateTime && (
                        <div className="text-[11px] text-amber-900 bg-white/80 p-2 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {isArabic
                              ? `سيتم حفظ المنشور وجدولته للإرسال التلقائي في: ${new Date(scheduledDateTime).toLocaleString('ar-SA', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}`
                              : `Will be scheduled for: ${new Date(scheduledDateTime).toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Action Button (Immediate or Schedule) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={publishMode === 'immediate' ? handleOneClickPublish : handleSchedulePost}
                    disabled={isPublishing}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 ${
                      publishMode === 'schedule'
                        ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900'
                    }`}
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{publishProgress || (isArabic ? 'جاري المعالجة...' : 'Processing...')}</span>
                      </>
                    ) : publishMode === 'schedule' ? (
                      <>
                        <CalendarClock className="w-4 h-4" />
                        <span>
                          {isArabic
                            ? `تأكيد جدولة المنشور إلى (${selectedPlatforms.length}) منصات`
                            : `Confirm Schedule to (${selectedPlatforms.length}) Platforms`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {isArabic
                            ? `نشر فوري بضغطة زر واحدة إلى (${selectedPlatforms.length}) منصات`
                            : `Publish Now with 1 Click to (${selectedPlatforms.length}) Platforms`}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    {publishMode === 'schedule'
                      ? isArabic
                        ? '📅 يتم حفظ الموعد في سجل المنشورات، مع إمكانية النشر الفوري المسبق أو الإلغاء في أي وقت'
                        : '📅 Saved to your scheduled queue with instant manual override anytime'
                      : isArabic
                      ? '⚡ يتم الإرسال الفوري لفيسبوك وتويتر وانستقرام وتيك توك مع حفظ السجل وتأكيد الوصول'
                      : '⚡ Instant parallel dispatch with real-time verification and deep share links'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Multi-Platform Previews (5 cols) */}
            <div className={`space-y-4 ${activeTab === 'editor' ? 'hidden lg:block lg:col-span-5' : 'lg:col-span-5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isArabic ? 'المعاينة المباشرة لشكل المنشور' : 'Live Social Previews'}
                  </h3>
                </div>

                {/* Preview Network Switcher */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                  {(['facebook', 'instagram', 'tiktok', 'twitter'] as PlatformId[]).map((pid) => (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setActivePreviewPlatform(pid)}
                      title={isArabic ? platforms[pid].nameAr : platforms[pid].nameEn}
                      className={`p-1.5 rounded-md transition-all ${
                        activePreviewPlatform === pid
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <PlatformBadgeIcon platform={pid} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Preview Element */}
              <PlatformPreview
                platform={activePreviewPlatform}
                text={currentPlatformText(activePreviewPlatform)}
                mediaUrl={mediaUrl}
                linkUrl={linkUrl}
                config={platforms[activePreviewPlatform]}
                lang={lang}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          {isArabic
            ? 'منصة النشر الموحد الذكية © 2026 · نشر فوري وجدولة آلية لفيسبوك وانستقرام وتيك توك وتويتر (X)'
            : 'MultiPublish Hub © 2026 · Instant broadcast & automated scheduling for Facebook, Instagram, TikTok and Twitter'}
        </p>
      </footer>

      {/* Publish Success Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        results={publishResults}
        platformsConfig={platforms}
        postText={postText}
        lang={lang}
        onCopyText={(text) => {
          navigator.clipboard.writeText(text);
          showToast(isArabic ? 'تم نسخ النص إلى الحافظة' : 'Copied to clipboard');
        }}
      />

      {/* Accounts & Webhooks Settings Drawer */}
      <AccountsSettings
        isOpen={accountsModalOpen}
        onClose={() => setAccountsModalOpen(false)}
        platforms={platforms}
        onUpdatePlatform={(id, updates) => {
          setPlatforms((prev) => {
            const next = {
              ...prev,
              [id]: { ...prev[id], ...updates },
            };
            try {
              localStorage.setItem('roots_ai_platforms_v2', JSON.stringify(next));
            } catch (_) {}
            return next;
          });
        }}
        webhookUrl={webhookUrl}
        onUpdateWebhook={(url) => {
          setWebhookUrl(url);
          showToast(isArabic ? 'تم حفظ إعدادات الـ Webhook' : 'Webhook updated');
        }}
        lang={lang}
      />
    </div>
  );
}
