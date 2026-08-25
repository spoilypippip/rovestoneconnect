# RoveStone Connect — Phase 2 Build Prompt: Online Checkout + LINE Handoff

> Paste this to Claude Code **after** (or together with) `RoveStone-Connect-UIUX-Prompt.md` — this extends that site with real purchasing and a post-purchase LINE handoff. Keep everything from the Phase 1 design system (§2 of that document) unchanged; nothing here should make the site look like a generic e-commerce template.

**One important correction before you build anything:** LINE Notify — the simple "push a notification with a token" service — was **discontinued by LINE on March 31, 2025** and no longer works. Do not implement against it. The replacement below uses the **LINE Messaging API** instead (see §5). This is a bit more setup than the old LINE Notify, but it's the only supported path now.

Sources confirming this: [LINE Notify closing announcement](https://notify-bot.line.me/closing-announce), [LINE Developers end-of-life notice](https://developers.line.biz/en/news/tags/end-of-life/1/).

---

## 1. What's changing from Phase 1

Phase 1 was a curated marketing site (5 service pillars, "from ฿X" pricing, no checkout, every CTA led to a consultation form). Phase 2 adds:

- A full catalog covering **all 12 service categories** from the pricing spreadsheet — not just the 5 curated pillars — because customers now need to find and buy the exact package they want.
- A cart + checkout flow.
- Payment collection, built against a **provider-agnostic interface** (no gateway has been chosen yet — see §4).
- A post-purchase handoff to LINE so a human advisor can continue the conversation with the customer.

Keep the Phase 1 homepage exactly as designed — it still leads with the 5 curated pillars. Each pillar's "Learn more" link and the new `/services` index below are the new entry points into the full catalog.

---

## 2. Data source: parse the pricing workbook, don't hand-copy it

The file **`Shalom_Thailand_ราคา_12หมวด_ต่อวีซ่า (1).xlsx`** is in the project folder. It is the single source of truth for the catalog — never hardcode prices in components. Write a build-time (or admin-triggered) script that reads it and outputs a typed JSON catalog.

### Sheet & columns to read
Sheet name: **`ราคา 11 หมวด`** (12 categories live in this one sheet — the name is legacy, don't rename it, just read from it). Header row 1, data from row 2 onward. Columns:

| Col | Header | Use |
|---|---|---|
| A | หมวดบริการ (Category) | Groups rows into the 12 categories — becomes the catalog's top-level product grouping |
| B | ระดับ (Tier/Level) | e.g. "7 วัน", "14 วัน", "30 วัน — แนะนำ", "1 ปี", "Add-on: ..." — becomes the purchasable SKU name |
| C | สิ่งที่รวม (What's included) | Public-facing description |
| D | THB ต่ำ | Price (or low end of a range) — **public** |
| E | THB สูง | High end of a range, when present — **public** |
| F, G | USD ต่ำ/สูง | Formulas, already computed — safe to read as cached values for a USD display toggle |
| H | หน่วย (Unit) | e.g. "ต่อแพ็ค (7 วัน)", "ต่อครั้ง", "ต่อเคส" — show next to the price |
| I–M | คู่เทียบตลาดจริง, ราคาคู่เทียบจริง, Source URL, เหตุผลการตั้งราคา, ความเชื่อมั่น | **Internal only.** These are competitive-pricing research notes for the business owner, not customer-facing copy. Load them into an internal/admin view only — never render them on the public site. |

### Business rules to apply while parsing (this logic lives in the parser, not scattered through UI components)

1. **Instant-buy vs. request-a-quote:** if column E (THB สูง) is populated — i.e. it's a genuine range like `5,500–22,000` — this is a variable-scope engagement. Render it as **"Request a Quote"** (goes to a form, not the cart), never as an instant "Add to cart" price. If E is empty, it's a fixed price and goes straight into checkout.
2. **Free-with-membership rows:** where D = 0 (e.g. Booking coordination's 7-day tier, "free for members / ฿199 without"), show the non-member price (column E in that specific row's case, or the stated fallback) as the purchasable price, with a small note "Free for members."
3. **Add-on rows** (level name starts with "Add-on:") are follow-on execution/fulfillment services. They're still purchasable standalone, but in the UI, group them visually beneath that category's 4 core tiers under a subheading like "Execution & add-on services" — don't mix them into the primary tier selector.
4. **Stable IDs:** generate a slug per row from category + tier (e.g. `visa-extension-advisory--30-day`) and persist a mapping file so IDs stay stable across re-imports even if row order or exact THB values change later. Cart and order records reference this slug, never a raw spreadsheet row number.
5. Re-running the import script should be **idempotent** and diff-friendly — re-importing after the business owner edits prices in the sheet should update existing catalog entries, not duplicate them.

---

## 3. Site structure additions

- **`/services`** — index of all 12 categories (card grid, same visual language as the Phase 1 pillar cards — generous whitespace, hairline borders, no e-commerce-template styling). Each card links to its category page.
- **`/services/[category-slug]`** — shows that category's 4 core tiers as a clean, quiet selector (radio-style cards, not a SaaS comparison table — reuse the "Standard Retainer" emphasis pattern from Phase 1 §6 for the recommended tier), then the add-on/execution services beneath, then any "Request a Quote" items with a form CTA instead of a price.
- **Cart** — supports multiple line items (a client may want Visa Advisory + Business Support together). Simple slide-over or dedicated `/cart` page, consistent styling, no cluttered upsell modals.
- **`/checkout`** — customer details (name, company, email, phone, preferred language), order summary, payment step (see §4).
- **`/order/[id]/confirmation`** — order confirmation, then the LINE handoff (see §5) as the primary next action, styled as prominently as the original CTA button, not a small afterthought link.
- **`/quote-request`** — the form destination for any "Request a Quote" item; captures which service/tier prompted it plus contact details, and notifies the team the same way as §5 (no payment involved).

---

## 4. Payment: build against an interface, not a specific gateway

No payment gateway has been chosen yet. Do not hard-wire the checkout to a specific provider's SDK in a way that's expensive to change later.

Define a small `PaymentProvider` interface:

```ts
interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }>
  verifyPayment(reference: string): Promise<{ status: "paid" | "pending" | "failed" }>
  handleWebhook(payload: unknown, headers: Headers): Promise<PaymentEvent>
}
```

Ship **one working implementation now** so the whole flow (cart → checkout → confirmation → LINE handoff) can be built and demoed end-to-end before a real gateway is wired in:

- **`ManualTransferProvider`** — checkout shows a PromptPay QR placeholder image + bank details (fields left blank for the owner to fill in) and a "I've paid" confirmation button. Order status becomes `pending_verification` rather than `paid`. This mirrors how many small Thai businesses actually operate at launch (staff manually confirms transfers) and needs zero third-party account setup to ship.

When a real gateway is chosen later (Omise/Opn Payments and 2C2P are the two most relevant candidates for a Thai-registered business accepting foreign cards — Omise/Opn is generally the faster to onboard with, 2C2P has broader Asian payment-method coverage like Alipay/WeChat Pay which may matter given the international customer base), implement it as a second class satisfying the same interface and swap it in via an environment variable — no changes needed elsewhere in the app.

---

## 5. Post-purchase LINE handoff

Two separate things — don't conflate them:

### A. Customer-facing: "Continue on LINE" (this part is simple and still works fine)
On the order confirmation page, a prominent button deep-links into LINE with the order reference pre-filled:
```
https://line.me/R/oaMessage/@YOUR_LINE_OA_ID/?{URL-encoded text, e.g. "Hi, I just purchased [Tier name] — order #[order-id]"}
```
This opens LINE (app or web) directly into a chat with your Official Account, with the message pre-composed so staff immediately know which order they're following up on. Requires only your LINE Official Account ID — no API integration needed for this half.

### B. Internal: notify the team a paid order needs follow-up
Since **LINE Notify is dead**, use the **LINE Messaging API** push message endpoint instead:
1. In the LINE Official Account Manager, enable the Messaging API for your OA and issue a **channel access token**.
2. Get the target **user ID** (yourself/staff) or **group ID** (a staff LINE group) once — either via the OA's webhook echoing an event, or LINE's account settings.
3. On successful payment (or on `pending_verification` for the manual-transfer provider), the backend calls:
   ```
   POST https://api.line.me/v2/bot/message/push
   Authorization: Bearer {LINE_CHANNEL_ACCESS_TOKEN}
   { "to": "{TARGET_ID}", "messages": [{ "type": "text", "text": "New order: ..." }] }
   ```
Env vars needed: `LINE_OA_ID` (for the customer deep-link), `LINE_CHANNEL_ACCESS_TOKEN` and `LINE_TARGET_ID` (for the internal push).

**If setting up the Messaging API channel is more than you want to do right now**, implement the internal notification behind the same kind of small interface as payment (`NotificationProvider`) with an email fallback (e.g. via Resend or plain SMTP) as the default, and LINE Messaging API as a second implementation to enable once the channel is set up. This keeps launch unblocked either way.

---

## 6. Order storage

You need somewhere to persist orders, line items, and payment/notification status — this can't live only in the browser or in the spreadsheet. Recommend **Supabase** (hosted Postgres, generous free tier, straightforward Next.js integration) for `orders`, `order_items`, `customers` tables. If a lighter/no-new-account option is preferred, note that as an open decision — but flag clearly that Google Sheets or a flat file is not appropriate for real transactional/payment data (concurrency and integrity risk), even though the *catalog* itself is fine to source from a spreadsheet (§2).

A nice-to-have, not a requirement for v1: also log each completed order as a row to a Google Sheet (via the Sheets API) purely for the owner's convenience, in addition to the real database — this suits how the business already tracks things.

---

## 7. Non-code items to flag back to the business owner (don't build these, just don't forget them)

- **Terms of service / refund policy:** since these are advisory *service* packages, not physical goods, the checkout should link to clear terms about what a "purchase" entitles the customer to (a consulting-access window) versus what still requires a separate follow-up quote (execution add-ons, anything flagged "Request a Quote"). Draft copy needed before launch — flag as a TODO, don't invent legal language.
- **Tax invoices/receipts:** Thailand requires proper tax invoice handling for VAT-registered businesses — confirm registration status before launch; the checkout flow should be built to attach an invoice/receipt step later even if it's manual for v1.
- **PromptPay/bank details, LINE OA ID, and whichever gateway is eventually chosen** are all placeholders in this build — search the codebase for `TODO:` markers before going live.

---

## 8. Design consistency reminder

Everything in this document — `/services`, the tier selector, cart, checkout — must still read as the same restrained, editorial site from Phase 1. The most common way this goes wrong: default e-commerce/checkout UI kits bring their own visual language (rounded buttons, colorful badges, dense information density) that will fight the Phase 1 design system. Hand-build these screens against the existing type scale, spacing, and color tokens rather than dropping in a generic checkout template.
