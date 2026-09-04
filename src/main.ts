import { onboard } from "./onboarding_service.js";

const result = await onboard({
  email: process.env.DEMO_EMAIL || "creator@example.com",
  password: process.env.DEMO_PASSWORD || "a-long-demo-password",
  name: process.env.DEMO_NAME || "Studio editor",
  inviteCode: process.env.DEMO_INVITE || "MEDIA-2026",
  captchaToken: process.env.DEMO_CAPTCHA_TOKEN || "demo-token"
});
console.log(JSON.stringify({ event: "community_member_onboarded", account: result }, null, 2));
