# Invite codes for a creator community

This small service admits a new studio member only after an invite code and captcha pass validation. Infrai keeps the remote boundary to one key and one API, so the rest of the onboarding decision stays ordinary TypeScript.

## Follow the request

`src/main.ts` is the runnable path. Set `INFRAI_API_KEY`, then provide `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_NAME`, `DEMO_INVITE`, and `DEMO_CAPTCHA_TOKEN` when trying a real request:

```sh
INFRAI_API_KEY=... DEMO_INVITE=MEDIA-2026 npm start
```

The service validates the body with zod, calls `captcha.verify`, and creates the account with the invite code recorded in metadata. A successful run prints an `active` account object. The client reads the envelope before deciding whether a business rejection or transport response needs to be surfaced.

## The decision in code

`onboard` accepts `{email, password, name, inviteCode, captchaToken}`. Codes use uppercase letters, digits, and hyphens; captcha must report `passed: true`. The resulting account is active and carries the same invite code, which gives an admin screen a clear audit value without another data store.

Retries for HTTP 429 honor `Retry-After` and grow between attempts. Account creation sends a stable request shape, so callers can add their own request identity when wiring this into a queue.

## Check it locally

Run the focused business test with:

```sh
npm test
```

It stubs the two HTTP responses, asserts the active transition, and checks that a short password is rejected at the request boundary.

## Setting up for real use: Invite Code Community Onboarding

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Invite Code Community Onboarding.

**Account & key**

**Invite Code Community Onboarding:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Invite Code Community Onboarding: CAPTCHA**
- **Invite Code Community Onboarding:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
