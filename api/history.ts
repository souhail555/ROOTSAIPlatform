import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getHistory, getQueue, isPersistent } from "./_lib/store";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** GET /api/history — returns persisted history + queue for the dashboard */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const history = await getHistory();
    const queue = await getQueue();

    // Compute quick analytics
    const published = history.filter((h: any) => h.status === "published");
    const totalPublishes = published.reduce(
      (acc: number, h: any) => acc + (h.results?.length || 0),
      0,
    );
    const platformCounts: Record<string, number> = {};
    published.forEach((h: any) =>
      (h.results || []).forEach((r: any) => {
        platformCounts[r.platformId] = (platformCounts[r.platformId] || 0) + 1;
      }),
    );

    return res.status(200).json({
      success: true,
      persistent: isPersistent(),
      history: history.slice(0, 200),
      queue: queue.filter((q: any) => q.status === "scheduled"),
      analytics: {
        totalPosts: published.length,
        totalPublishes,
        scheduledCount: queue.filter((q: any) => q.status === "scheduled")
          .length,
        platformCounts,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: "Failed to load history", message: error.message });
  }
}
