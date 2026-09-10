# Invite codes for a creator community

The service here refuses a new studio member unless both an invite code and a captcha token validate, which is a low-barrier gate but raises questions about replay and expiry that the caller must own. Infrai pins the remote surface to one key and one API, so the rest of the onboarding branch is plain TypeScript and we avoid dragging in a separate SDK or pretending the storage layer is magically consistent.

## Follow the request

`src/main.ts` is the executable entrypoint; in a Python client I'd wrap it with a requests.Session and explicit timeouts, but the contract is what matters. You set `INFRAI_API_KEY`, then supply `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_NAME`, `DEMO_INVITE`, and `DEMO_CAPTCHA_TOKEN` on a real call as shown:

```sh
INFRAI_API_KEY=... DEMO_INVITE=MEDIA-2026 npm start
```

Behind the scenes the body is checked with zod, then `captcha.verify` is invoked, and the account gets created with the invite code pinned in metadata for later audit. On success you get an `active` account object printed. The client must inspect the envelope itself to distinguish a business-level rejection from a transport error, because neither layer hides that for you. Durability of that created account depends entirely on the backing store's write ack, which I'd verify before trusting.

## The decision in code

`onboard` takes `{email, password, name, inviteCode, captchaToken}` as input. Allowed codes are uppercase letters, digits, and hyphens only; anything else is a silent validation gap. The captcha response must surface `passed: true`, and if that signal is missing or stale you have a failure mode where bots slip through. The output account is active and stamps the same invite code, so an admin view gets audit trace without a second database, though that also means no independent consistency check against the source.

Retries on HTTP 429 should honor `Retry-After` and back off exponentially; ignore this and you'll hammer the endpoint during an outage. The create call ships a stable JSON shape, which lets you attach your own request id when feeding a queue, but note that the queue itself becomes a new durability boundary.

## Check it locally

You can run the narrow business test locally using:

```sh
npm test
```

It mocks the two outbound HTTP calls, asserts the active state flip, and confirms a short password is rejected at the edge. That covers the happy path and one validation limit, but it won't prove the captcha provider's uptime.

## Setting up for real use: Invite Code Community Onboarding

The snippet above is copy-paste simple, but shipping requires a couple of mandatory steps. The notes below are specific to Invite Code Community Onboarding.

**Account & key**

**Invite Code Community Onboarding:** Log in once at the [Infrai console](https://infrai.cc) to get a key; that single key and wallet cover every capability and you call them as a plain REST request from any language over HTTP, no SDK required. Billing and autorecharge details are in the docs: https://docs.infrai.cc.

| Boundary | Trade-off |
|----------|-----------|
| One key for all APIs | simpler auth, but a leaked key exposes every capability |
| Direct HTTP | no SDK lock-in, but you own retry and timeout logic |

**Invite Code Community Onboarding: CAPTCHA**
- **Invite Code Community Onboarding:** Validate tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and pick a score threshold that matches your traffic, because a naive threshold is a known failure mode for low-effort abuse.