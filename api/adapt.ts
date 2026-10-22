import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { originalText, targetLanguage = "ar" } = req.body || {};

    if (
      !originalText ||
      typeof originalText !== "string" ||
      originalText.trim() === ""
    ) {
      return res.status(400).json({ error: "Text content is required" });
    }

    if (ai) {
      try {
        const prompt = `You are a world-class social media strategist and medical/tech copywriter for ROOTS AI HEALTH.
Take this base post or long-form article (which may contain up to 4,000+ words):
"""
${originalText}
"""

Adapt and optimize this post for 4 major social networks in ${targetLanguage === "ar" ? "Arabic" : "English"}:
1. "twitter": Under 280 characters, punchy executive summary or thread hook summarizing the core insight, with 2-3 hashtags.
2. "facebook": Long-form friendly format, retaining key insights, headings, and friendly call to action.
3. "instagram": Engaging structured summary with key bullet points and 5-8 hashtags.
4. "tiktok": Short, high-energy video teaser hook summarizing the main insight, with #fyp and health AI tags.

Respond strictly in valid JSON matching this schema:
{
  "twitter": "string",
  "facebook": "string",
  "instagram": "string",
  "tiktok": "string"
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI generation timeout")), 12000),
        );

        const aiPromise: any = ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const responseText = response?.text;
        if (responseText) {
          const parsed = JSON.parse(responseText);
          return res.status(200).json({ success: true, adapted: parsed });
        }
      } catch (e) {
        console.warn("AI adapt note, using smart formatter fallback:", e);
      }
    }

    // Smart formatter fallback
    const trimmed = originalText.trim();
    const twitterText =
      trimmed.length > 250
        ? trimmed.slice(0, 240) + "... 🧵 [المقال الكامل بالرابط]"
        : trimmed;
    const instagramText =
      trimmed.length > 2100
        ? trimmed.slice(0, 2000) +
          "...\n\n(لقراءة المقال كاملاً تابع صفحتنا الرسمية)"
        : trimmed;
    const tiktokText =
      trimmed.length > 300
        ? trimmed.slice(0, 250) + "...\n\n#ROOTS_AI_HEALTH #صحة #fyp #ترند"
        : trimmed;

    return res.status(200).json({
      success: true,
      adapted: {
        twitter: `${twitterText}\n\n#ROOTS_AI_HEALTH #تحديث`,
        facebook: `${trimmed}\n\nشاركونا آراءكم وتعليقاتكم حول هذه الرؤية! 👇\n#ROOTS_AI_HEALTH`,
        instagram: `${instagramText}\n.\n.\n📍 احفظ المنشور للرجوع إليه!\n#ROOTS_AI_HEALTH #اكسبلور #صحة_رقمية #جديد`,
        tiktok: `شاهد للنهاية! 👀🩺\n${tiktokText}`,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error in /api/adapt:", error);
    return res
      .status(500)
      .json({ error: "Failed to adapt content", message: error.message });
  }
}
