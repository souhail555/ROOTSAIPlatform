/**
 * Shared storage layer for Vercel Serverless Functions.
 * Persists publish history & scheduled queue to /tmp (per-instance) or
 * an external KV REST API (e.g. Vercel KV / Upstash) if env vars are set.
 *
 * Env vars (optional, for true persistence across instances):
 *   KV_REST_API_URL, KV_REST_API_TOKEN  (Upstash-compatible)
 */

type HistoryRecord = any;

const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const HISTORY_KEY = 'roots_ai_history_v1';
const QUEUE_KEY = 'roots_ai_queue_v1';

// In-memory fallback (per lambda instance)
let memHistory: HistoryRecord[] | null = null;
let memQueue: HistoryRecord[] | null = null;

async function kvGet(key: string): Promise<any | null> {
  try {
    const res = await fetch(`${KV_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const json = await res.json();
    return json.result ? JSON.parse(json.result) : null;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: any): Promise<void> {
  try {
    await fetch(`${KV_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: JSON.stringify(value) }),
    });
  } catch (e) {
    console.warn('KV set failed:', e);
  }
}

export async function getHistory(): Promise<HistoryRecord[]> {
  if (useKV) {
    const data = await kvGet(HISTORY_KEY);
    return Array.isArray(data) ? data : [];
  }
  return memHistory || [];
}

export async function setHistory(records: HistoryRecord[]): Promise<void> {
  memHistory = records;
  if (useKV) await kvSet(HISTORY_KEY, records);
}

export async function getQueue(): Promise<HistoryRecord[]> {
  if (useKV) {
    const data = await kvGet(QUEUE_KEY);
    return Array.isArray(data) ? data : [];
  }
  return memQueue || [];
}

export async function setQueue(records: HistoryRecord[]): Promise<void> {
  memQueue = records;
  if (useKV) await kvSet(QUEUE_KEY, records);
}

export function isPersistent(): boolean {
  return useKV;
}
