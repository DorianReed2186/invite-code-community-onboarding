import assert from "node:assert/strict";
import { onboard } from "../src/onboarding_service.js";

const originalFetch = globalThis.fetch;
globalThis.fetch = async (_input, init) => {
  const body = JSON.parse(String(init?.body));
  if (body.token) return new Response(JSON.stringify({ ok: true, data: { passed: true }, metadata: {} }), { status: 200 });
  return new Response(JSON.stringify({ ok: true, data: { id: "user_123" }, metadata: {} }), { status: 200 });
};

const account = await onboard({ email: "editor@example.com", password: "password-12345", name: "Editor", inviteCode: "MEDIA-2026", captchaToken: "token" });
assert.equal(account.state, "active");
assert.equal(account.inviteCode, "MEDIA-2026");
await assert.rejects(() => onboard({ email: "editor@example.com", password: "short", name: "Editor", inviteCode: "MEDIA-2026", captchaToken: "token" }));
globalThis.fetch = originalFetch;
console.log("onboarding decision test passed");
