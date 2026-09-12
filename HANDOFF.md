# RoveStone Connect — Handoff

Context for continuing this work in a new Claude Code session. Repo:
`https://github.com/spoilypippip/rovestoneconnect.git` (branch `main`).

## Stack

- Next.js 16.3.1 (App Router, Turbopack) — **this version has breaking
  changes vs. training data.** Read `node_modules/next/dist/docs/` before
  writing Next-specific code (this is enforced by `AGENTS.md` /
  `CLAUDE.md` in the repo root).
- React 19.2, TypeScript 7.0, Tailwind 4.3
- Order storage: Supabase (Postgres) in production, SQLite fallback for
  local dev (`lib/orders/`)
- Notifications: email (Resend REST API) or LINE Messaging API
  (`lib/notifications/`)
- Payments: pluggable `PaymentProvider` interface (`lib/payments/`) — see
  below, this is the main thing this session worked on.

## Session 1 — Services page (done, committed, pushed)

Commit `aa53b71` (already on `origin/main`):

- Added `app/services/page.tsx` — dedicated `/services` listing page.
- Added `components/FeaturedService.tsx` — lighter homepage services
  section, replaces `ServicesSection` on `/` (`app/page.tsx`).
- Replaced all `/#services` anchor links with real `/services` links in
  nav, footer, cart empty-state, and category page back-link
  (`content/site.ts`, `app/cart/page.tsx`,
  `app/services/[categorySlug]/page.tsx`).

Nothing left to do here.

## Session 2 — Stripe payment integration (done, code complete, **NOT committed yet**)

Status: `git status` shows these as uncommitted working-tree changes.
**Whoever picks this up should review the diff, then commit it** (not
done automatically per this repo's git-safety rules — only commit when
explicitly asked).

### Why this shape

`lib/payments/types.ts` already defined a `PaymentProvider` interface
before this session touched anything, specifically so a real gateway
could be added later without changing the checkout flow:

```ts
export interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }>;
  verifyPayment(reference: string): Promise<{ status: "paid" | "pending" | "failed" }>;
  handleWebhook(payload: unknown, headers: Headers): Promise<PaymentEvent>;
}
```

The only prior implementation was `ManualTransferProvider` (PromptPay /
bank transfer, confirmed by hand — still the default). This session
added `StripeCheckoutProvider` implementing the same interface, so
`app/checkout/actions.ts` and the checkout page needed **no changes** to
their control flow — the page already had a branch for
`redirectUrl` (used by any hosted-checkout gateway) vs. no-`redirectUrl`
(manual transfer's own QR/bank-details UI).

### Files added

- **`lib/payments/stripe.ts`** — `StripeCheckoutProvider` class:
  - `createCheckoutSession`: creates a Stripe Checkout Session (mode
    `payment`, line items built from `order.items`, THB currency,
    `metadata.orderId` + `client_reference_id` set to the order id so the
    webhook can find it back), returns the hosted Checkout URL as
    `redirectUrl`.
  - `verifyPayment(sessionId)`: reads a Checkout Session back from
    Stripe's API — used as a fallback, not the primary status path.
  - `handleWebhook(rawBody, headers)`: verifies the `stripe-signature`
    header with `STRIPE_WEBHOOK_SECRET` via
    `stripe.webhooks.constructEventAsync`, and on
    `checkout.session.completed` returns `{ orderId, status }`. Other
    event types return `{ orderId: "", status: "pending" }` (acknowledged,
    ignored — the webhook route treats an empty `orderId` as "nothing to
    update").
  - Full setup checklist a human must do (Stripe account, dashboard
    webhook config, env vars) is written as a comment at the top of the
    class — not something this codebase can do for itself.

- **`app/api/webhooks/stripe/route.ts`** — new Route Handler, `POST`
  only, `runtime = "nodejs"`. Reads the body with `request.text()`
  (important: raw text, not `.json()`, or Stripe's signature check
  fails), calls `paymentProvider.handleWebhook`, and on a real event
  updates the order status via `getOrderStore()` and fires
  `notificationProvider.notifyNewOrder` when the order is `paid`.

### Files changed

- **`lib/payments/index.ts`** — now exports `activePaymentProviderName`
  (`"stripe"` if `STRIPE_SECRET_KEY` is set, else `"manual-transfer"`)
  and picks the provider instance accordingly. **This is the single
  switch that turns Stripe on** — no other code branches on it.
- **`app/checkout/actions.ts`** — `paymentProvider: "manual-transfer"`
  literal replaced with `activePaymentProviderName`, so orders record
  which gateway actually took the payment.
- **`app/order/[id]/confirmation/page.tsx`** — now reads
  `searchParams.session_id` (Stripe appends
  `?session_id={CHECKOUT_SESSION_ID}` to the success URL). If the order
  is still `pending_payment` when the customer lands here (i.e. their
  browser redirect beat Stripe's webhook), it calls
  `paymentProvider.verifyPayment` as a fallback and updates the status
  immediately rather than showing a stale "pending" message that the
  webhook would correct moments later anyway. Copy also now branches on
  `order.status === "paid"` vs. not, instead of hardcoding manual-transfer
  wording ("verifying your transfer").
- **`.env.example`** — added `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `SITE_URL` (used to build Stripe's `success_url`/`cancel_url`; falls
  back to `VERCEL_URL` on Vercel, then `localhost:3000`).
- **`package.json` / `package-lock.json`** — added `stripe` (`^22.6.0`,
  the official Node SDK).

### Verified this session

- `npx tsc --noEmit` — clean.
- `npm run build` (`next build`) — clean, `/api/webhooks/stripe` shows up
  correctly as a dynamic (`ƒ`) route in the build output.
- **Did NOT run `next dev`, did NOT create a Stripe account, did NOT hit
  any Stripe API, did NOT trigger a real or test checkout/payment.** This
  was explicit per the user's instruction — money-movement testing was
  left entirely for a human to do with their own Stripe credentials.
- `npm run lint` currently fails, **pre-existing and unrelated** to this
  work: `typescript-eslint` doesn't yet support TypeScript 7.0, which
  this repo already pinned before this session started
  (`node_modules/eslint-config-next/.../typescript-eslint` throws
  "typescript-eslint does not support TS 7.0"). Not something introduced
  by the Stripe change; worth fixing separately (downgrade TS to 6.x, or
  wait for typescript-eslint to add TS 7 support).

### What a human still has to do before this is live

None of this can be scripted by an agent — it requires an actual Stripe
account and dashboard access:

1. Create/activate a Stripe account (payouts require identity/business
   verification).
2. Set `STRIPE_SECRET_KEY` in `.env.local` — start with a **test** key
   (`sk_test_...`).
3. In the Stripe Dashboard, add a webhook endpoint pointing at
   `<site origin>/api/webhooks/stripe`, subscribed to
   `checkout.session.completed`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
4. Set `SITE_URL` to the real https origin (skip on Vercel — `VERCEL_URL`
   is automatic there, though note it's `http`-less and this code
   prepends `https://`, which is wrong for preview deploys behind
   Vercel's own proxy only if you're testing on `http://localhost`
   manually instead — in short: just set `SITE_URL` explicitly for
   anything that isn't a Vercel deployment).
5. Test the full flow with Stripe's test cards
   (`4242 4242 4242 4242`, etc.) and `stripe listen --forward-to
   localhost:3000/api/webhooks/stripe` (Stripe CLI) to receive webhooks
   locally.
6. Once verified, switch `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` to
   live-mode values.

### Suggested next steps for whoever continues this

1. Review the diff (`git status` / `git diff`), then commit it.
2. Do the human setup steps above, in Stripe test mode first.
3. Consider whether `CreateOrderResult.payment` in
   `app/checkout/actions.ts` (typed as `typeof manualTransferDetails`)
   should be made optional/gateway-agnostic — right now it's always
   present in the return type even though the Stripe path never uses it
   (the checkout page redirects away before reading it). Harmless as-is,
   but a bit misleading.
4. Decide whether to fix the `typescript-eslint`/TS 7.0 lint breakage
   before or independently of this work.

## Known pre-existing note

`origin` remote in `.git/config` has a GitHub PAT embedded directly in
the HTTPS URL (plaintext). Not introduced this session, but worth
migrating to a credential helper or SSH key so the token isn't sitting
in plaintext config.
