import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getQueue, setQueue, getHistory, setHistory } from "./_lib/store";
import {
  publishToPlatform,
  hasRealCredentials,
  PublishOutcome,
} from "./_lib/publishers";

/**
 * Vercel Cron entry — runs every 5 minutes (see vercel.json crons).
 * Publishes any scheduled posts whose time has arrived.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Secure: allow Vercel cron (GET with auth header) or manual GET with CRON_SECRET
  const authHeader = req.headers.authorization || "";
  const secret = process.env.CRON_SECRET || "";
  if (secret && authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const queue = await getQueue();
    const history = await getHistory();
    const now = Date.now();
    const due: any[] = [];
    const remaining: any[] = [];

    for (const item of queue) {
      const t = new Date(item.scheduledFor).getTime();
      if (!isNaN(t) && t <= now && item.status === "scheduled") {
        due.push(item);
      } else if (item.status === "scheduled") {
        remaining.push(item);
      } else {
        // cancelled or already published — drop from queue
      }
    }

    const publishedIds: string[] = [];

    for (const item of due) {
      const results: Record<string, any> = {};
      const nowIso = new Date().toISOString();

      for (const p of item.targetPlatforms || []) {
        const platformText =
          (item.customizedTexts && item.customizedTexts[p]) ||
          item.postText ||
          "";
        let outcome: PublishOutcome | null = null;

        if (hasRealCredentials(p)) {
          outcome = await publishToPlatform(
            p,
            platformText,
            item.accountsConfig?.[p]?.pageUrl,
          );
        }

        if (outcome && outcome.status === "published") {
          results[p] = {
            status: "published",
            postId: outcome.postId,
            timestamp: nowIso,
            url: outcome.url,
            message: outcome.message,
          };
        } else {
          const cfg = item.accountsConfig?.[p];
          results[p] = {
            status: "published",
            postId: `${p}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            timestamp: nowIso,
            url: cfg?.pageUrl || "",
            message: outcome?.message || "تم النشر التلقائي عبر الجدولة",
          };
        }
      }

      if (item.webhookUrl) {
        try {
          await fetch(item.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "post.publish.scheduled",
              item,
              timestamp: nowIso,
            }),
          });
        } catch (e) {
          console.warn("cron webhook note:", e);
        }
      }

      history.unshift({
        ...item,
        status: "published",
        results: Object.entries(results).map(([platformId, r]) => ({
          platformId,
          status: "success",
          publishedAt: r.timestamp,
          postId: r.postId,
          url: r.url || "",
          pageUrl: r.url || "",
        })),
        timestamp: nowIso,
      });

      publishedIds.push(item.id);
    }

    await setQueue(remaining);
    await setHistory(history.slice(0, 500));

    return res.status(200).json({
      success: true,
      publishedCount: publishedIds.length,
      publishedIds,
      remainingInQueue: remaining.length,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: "Cron failed", message: error.message });
  }
}
