import { z } from "zod";
import { captcha, infraiRequest, InfraiError } from "./infrai_client.js";

const signupSchema = z.object({
  email: z.string().email(), password: z.string().min(10), name: z.string().min(1),
  inviteCode: z.string().regex(/^[A-Z0-9-]{6,32}$/), captchaToken: z.string().min(1)
});

export type SignupInput = z.infer<typeof signupSchema>;
export type Account = { id: string; email: string; name: string; state: "active"; inviteCode: string };

export async function onboard(raw: unknown): Promise<Account> {
  const input = signupSchema.parse(raw);
  const captchaResult = await captcha.verify({ widget_record_id: "community_signup", token: input.captchaToken, action: "community_signup", score_threshold: 0.5 });
  if (!captchaResult.passed) throw new Error("captcha rejected");
  const user = await infraiRequest<{ id: string }>("/v1/auth/user/create", {
    method: "POST",
    body: JSON.stringify({ email: input.email, password: input.password, name: input.name, metadata: { invite_code: input.inviteCode, account_state: "active" }, mode: "community" })
  });
  return { id: user.id, email: input.email, name: input.name, state: "active", inviteCode: input.inviteCode };
}
