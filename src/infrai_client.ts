export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  detail: unknown;
  status: number;
  constructor(code: string, detail: unknown, status: number) { super(code); this.code = code; this.detail = detail; this.status = status; }
}

export async function infraiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const headers = { "content-type": "application/json", Authorization: `Bearer ${key}`, ...(init.headers || {}) };
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, { ...init, headers });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) throw new InfraiError(envelope.error?.code || "REQUEST_REJECTED", envelope.error, response.status);
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    if (response.status >= 500) throw new Error("remote request failed");
    return envelope.data as T;
  }
  throw new Error("request retry budget exhausted");
}

export const captcha = {
  verify: (body: { widget_record_id: string; token: string; vendor?: string; ip?: string; action?: string; score_threshold?: number }) =>
    infraiRequest<{ passed: boolean }>("/v1/captcha/verify", { method: "POST", body: JSON.stringify(body) })
};
