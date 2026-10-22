import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getQueue, setQueue, getHistory, setHistory } from "./_lib/store";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      platforms = ["facebook", "instagram", "tiktok", "twitter"],
      content,
      customizedTexts,
      mediaUrl,
      scheduledFor,
      webhookUrl,
      accountsConfig,
      twitterMode = "long_post",
      threadTweets = [],
    } = req.body || {};

    if (!scheduledFor) {
      return res
        .status(400)
        .json({ error: "scheduledFor date and time is required" });
    }

    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Persist to queue so cron job can pick it up
    const queue = await getQueue();
    queue.push({
      id: scheduleId,
      postText: content || "",
      mediaUrl: mediaUrl || null,
      timestamp: now,
      results: [],
      isScheduled: true,
      scheduledFor,
      status: "scheduled",
      targetPlatforms: platforms,
      customizedTexts: customizedTexts || {},
      twitterMode,
      threadTweets,
      webhookUrl: webhookUrl || "",
      accountsConfig: accountsConfig || {},
    });
    await setQueue(queue);

    return res.status(200).json({
      success: true,
      scheduleId,
      scheduledFor,
      createdAt: now,
      platforms,
      message: "تمت جدولة المنشور بنجاح",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: "Scheduling failed", message: error.message });
  }
}
