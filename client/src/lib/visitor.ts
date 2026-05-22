/**
 * Per-browser visitor identifier. Persisted in localStorage so the same
 * browser is recognized across sessions; falls back to a random per-tab
 * value when storage is unavailable (Safari Private mode, etc.).
 *
 * Sent to the server in the `X-Visitor-Id` header on every tRPC request.
 */
const KEY = "saadiyat:visitor-id";

let cached: string | null = null;

function genId(): string {
  // 22-char base36 random; enough entropy for our needs.
  const a = Math.floor(Math.random() * 1e16).toString(36);
  const b = Math.floor(Math.random() * 1e16).toString(36);
  return (a + b).slice(0, 22);
}

export function ensureVisitorId(): string {
  if (cached) return cached;
  if (typeof window === "undefined") {
    cached = genId();
    return cached;
  }
  try {
    let v = window.localStorage.getItem(KEY);
    if (!v) {
      v = genId();
      window.localStorage.setItem(KEY, v);
    }
    cached = v;
    return v;
  } catch {
    cached = genId();
    return cached;
  }
}
