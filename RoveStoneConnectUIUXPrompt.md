# RoveStone Connect — UI/UX Build Prompt for Claude Code

> Paste this entire document to Claude Code as your starting prompt. It contains brand context, design system, information architecture, section-by-section content, and technical requirements — everything needed to generate a first working version of the site without further clarification.

---

## 1. Project Brief

Build a marketing website for **RoveStone Connect** — a MICE (Meetings, Incentives, Conferences, Exhibitions) industry and Destination Management Company (DMC) based in Thailand.

**Audience:** International corporate clients, business travelers, event planners, and MICE industry professionals — NOT leisure tourists. Every design and copy decision should read as *considered, expert, and understated* rather than promotional.

**Positioning:** RoveStone Connect is the trusted local partner for companies and executives operating in Thailand — handling everything from visa advisory to event logistics to market entry, with the credibility of an established consultancy and the responsiveness of a boutique concierge.

**Tone:** Quiet confidence. Think of how a private bank, a bespoke law firm, or a five-star hotel group's corporate site reads — not how a SaaS pricing page or a tour operator reads. No exclamation marks, no "Book Now!" urgency language, no discount badges.

---

## 2. Design System

### Principle
Premium reads as *restraint*, not decoration. When in doubt, remove an element rather than add one.

### Color palette
- **Ink** `#14181F` — primary text, headlines
- **Paper** `#FAF8F4` — primary background (warm off-white, not stark white)
- **Charcoal** `#3A3F47` — secondary text
- **Line** `#E3DFD6` — hairline borders, dividers (never a heavy box-shadow)
- **Accent — Brass** `#9C7A3C` — used *sparingly*: one CTA per view, small marks, hover states. Never as a large fill.
- **Deep Teal** `#1B3A3F` (optional secondary accent for a section background or dark footer)

Avoid: bright saturated colors, gradients, drop shadows heavier than 1–2px blur, rounded "bubbly" corners over 6px radius.

### Typography
- **Display / Headlines:** a refined serif — e.g. `"Fraunces"`, `"Newsreader"`, or `"GT Sectra"` fallback to `"Georgia", serif`. Large size (48–72px desktop H1), tight letter-spacing, generous line-height (1.1–1.2).
- **Body / UI:** a clean grotesk — e.g. `"Inter"`, `"Neue Haas Grotesk"`, or system-ui fallback. 16–18px body, 1.6 line-height.
- **Eyebrow labels** (small category tags above headlines): uppercase, letter-spacing +0.12em, 12–13px, Charcoal color, not bold — weight 500 max.
- Never use more than 2 typefaces total.

### Spacing & layout
- 12-column grid, max content width ~1280px, generous section padding (120–160px vertical on desktop, 64–80px mobile).
- White space is the primary luxury signal — err toward more, not less.
- Sections separated by a 1px hairline (`Line` color) or by background color shift (Paper ↔ white), never by heavy dividers or drop shadows.

### Imagery
- Editorial, documentary-style photography (Bangkok skyline at dusk, a well-appointed meeting room, a delegate walking through an airport lounge, a temple detail shot used sparingly as texture). No generic stock-photo handshakes, no smiling-at-laptop stock imagery, no cartoon illustrations, no emoji.
- If real photography isn't available yet, use a muted duotone treatment (Ink + Paper) over placeholder images, or restrained thin-line geometric graphics — never flat colorful icon sets from icon libraries like Font Awesome default style.

### Motion
- Subtle only: fade-in + 12–16px upward translate on scroll, 400–600ms ease-out. No bounce, no parallax gimmicks, no auto-playing carousels.

---

## 3. Information Architecture

Single-page or lightly multi-page (Home + Services detail + Contact) — recommend **single scrolling homepage** with anchor navigation for a simple, premium feel, plus one `/contact` page with the consultation form.

1. Navigation (sticky, minimal: logo left, 4–5 links right, one CTA button)
2. Hero
3. Trust bar
4. Service Pillars (curated — see §4, NOT all 12 raw categories)
5. How We Work (process)
6. Signature Engagement (the flagship offering, given visual prominence)
7. Indicative Investment (pricing — progressive disclosure, see §5)
8. Testimonials / Client Note
9. About / Local Expertise
10. Consultation Request (contact form)
11. Footer

---

## 4. Curated Service Pillars — DO NOT show all 12 raw spreadsheet categories

The source data has 12 service categories, each with 4 duration-based advisory tiers (7-day / 14-day / 30-day / 1-year) plus execution add-ons. Showing all of that on a premium B2B site would read as a cluttered consumer pricing grid. **Group into 5 pillars**, each a short card with a one-line description and a "from" price only — full detail lives behind a "View details" expand or the contact form, not in the main grid.

Drop **Community connection** entirely from this site — it's a consumer/membership category not relevant to a MICE/corporate audience.

Rename the duration tiers for this audience — do not use "7-day pack" language, use consulting-register naming:
- 7 days → **Rapid Advisory**
- 14 days → **Focused Engagement**
- 30 days → **Standard Retainer** (this is the anchor/flagship tier — give it visual emphasis)
- 1 year → **Annual Partnership**

### Pillar 1 — MICE & Destination Management
*Event logistics, venue sourcing, delegate accommodation, and on-the-ground coordination for your Thailand program.*
(Maps to: Travel arrangements + Booking coordination + Accommodation questions)
- Rapid Advisory from **฿400**
- Standard Retainer **฿2,900**
- Full program management — *proposal on request*

### Pillar 2 — Visa & Immigration Advisory
*Independent visa and immigration guidance for business travelers and long-stay executives — advisory only, no commissions, no bias toward any filing agent.*
(Maps to: Visa extension advisory)
- Rapid Advisory from **฿400**
- Standard Retainer **฿1,900**
- Annual Partnership **฿8,900**
- Filing/execution handled on your behalf — *add-on, priced per case*

### Pillar 3 — Business Setup & Market Entry
*Company registration, BOI advisory, and work permit coordination for enterprises entering the Thai market.*
(Maps to: Business support)
- Rapid Advisory from **฿700**
- Standard Retainer **฿4,900**
- Registration & BOI execution — *proposal on request*

### Pillar 4 — Executive Concierge
*Dedicated, discreet concierge support for executives, delegations, and their families.*
(Maps to: VIP concierge)
- Rapid Advisory from **฿1,500**
- Standard Retainer **฿5,500**
- Annual Partnership **฿55,000**

### Pillar 5 — Language & Cultural Advisory
*Certified translation, professional interpretation, and cross-cultural business briefings for teams operating in Thailand.*
(Maps to: Translation + Local culture)
- Rapid Advisory from **฿400**
- Standard Retainer **฿2,900**

*(Optional 6th pillar if there's room — "Trusted Local Network" mapping to Finding trustworthy services + Relocation, same treatment.)*

---

## 5. Pricing display — the premium pattern

**Do not** build a 3–4 column SaaS-style pricing table with checkmarks, "Most Popular" ribbons, or big colorful price numerals. That pattern reads as consumer software, not a consultancy.

Instead:
- On each Pillar card, show only **"From ฿XXX"** in small, quiet typography (body weight, not display-serif, not oversized) — a price is a data point here, not the hero of the card.
- Round all displayed prices to the nearest sensible figure for this context (e.g. show **฿400**, not the internal ฿399 charm-price used on the consumer-facing Shalom Thailand site — sharp .99-style pricing reads as discount retail and undercuts this site's positioning).
- Add a single **"View indicative pricing"** text link/accordion beneath the pillar grid. Expanding it reveals a clean, minimal table (thin hairline rows, no fills, no borders around cells) listing the 4 tiers per pillar — still text-forward, no colored badges.
- Every pillar and every pricing view ends in the same CTA: **"Request a Consultation"** — never "Buy Now," "Subscribe," or "Get Started."
- High-complexity/high-value items (BOI advisory, Premium Family relocation, deep due-diligence) should say **"Proposal on request"** with no number shown at all — consistent with how consultancies and law firms price bespoke work.

---

## 6. Section-by-section content

### Hero
- Eyebrow: `DESTINATION MANAGEMENT · BANGKOK`
- H1 (serif, large): "Your trusted partner for business in Thailand."
- Subhead (1–2 sentences, body font): "RoveStone Connect provides independent advisory and on-the-ground support for MICE programs, business travel, and market entry — from local specialists who know how Thailand actually works."
- CTA: "Request a Consultation" (Brass accent button, minimal — just text + thin border or subtle fill, not a heavy gradient button)
- Background: full-bleed editorial photo (Bangkok skyline at dusk or a refined meeting space), Ink overlay at low opacity for text contrast.

### Trust bar
Thin strip beneath hero. Small caps stats, evenly spaced, no icons or minimal line icons only:
`12 SERVICE LINES` · `MULTILINGUAL TEAM` · `INDEPENDENT ADVISORY — NO COMMISSIONS` · `BANGKOK-BASED`

### Service Pillars
5 cards, 3-up or 2-up grid depending on breakpoint. Each: eyebrow label, short headline, 1-sentence description, "From ฿X" line, "Learn more →" text link. Generous internal padding, hairline border only (no shadow).

### How We Work
4-step horizontal process (numbered 01–04, not icon-heavy):
`01 Consult` — a confidential conversation to understand your needs
`02 Plan` — a tailored proposal, scoped and priced transparently
`03 Execute` — our specialists handle the details on the ground
`04 Support` — ongoing advisory for as long as you need us

### Signature Engagement (flagship callout)
A visually distinct full-width band (Deep Teal background, Paper text) highlighting the **Standard Retainer** (30-day) tier as the recommended entry point — framed as "the engagement most clients start with," not as a discount. Include one supporting sentence on why (covers a full visa cycle / a full event-planning cycle / etc.) and the CTA.

### Indicative Investment
As specified in §5 — pillar "from" prices + the expandable detail table + "Proposal on request" language for bespoke items.

### Testimonials / Client Note
1–2 short, specific quotes (placeholder copy for now, clearly marked `[PLACEHOLDER — replace with real client quote]`) from a "VP of Global Events" / "Regional HR Director" persona — signals the B2B audience without needing real logos yet.

### About / Local Expertise
Short paragraph + team photo or portrait grid. Emphasize: Bangkok-based, multilingual (English / Thai / Hebrew / Russian), independent (no commission-based referrals), years of on-the-ground experience.

### Consultation Request
Simple form: Name, Company, Email, Phone, "Which service are you interested in?" (dropdown of the 5 pillars), Message. No multi-step wizard, no excessive required fields. Confirmation state should be equally understated ("Thank you — we'll respond within one business day.").

### Footer
Logo, 3–4 nav links repeated, contact email/phone, language switcher (EN / TH), social links if any, small copyright line.

---

## 7. Technical requirements

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS. Keep dependencies minimal — no heavy UI kit; hand-build components to match the restrained design system above (a component library's default styling will fight against this aesthetic).
- **Fonts:** load via `next/font` (self-hosted, not a render-blocking Google Fonts `<link>`).
- **Responsive:** mobile-first; test at 375px, 768px, 1280px, 1920px. Stack pillar cards to 1-column under 640px.
- **Accessibility:** semantic HTML landmarks, sufficient color contrast (verify Ink-on-Paper and Paper-on-DeepTeal meet WCAG AA), visible focus states, alt text on all images, form labels properly associated.
- **Performance:** optimize/lazy-load hero and section imagery (`next/image`), avoid layout shift, target Lighthouse 90+ on Performance and Accessibility.
- **i18n-ready:** structure copy so an English/Thai toggle can be added later even if only English is built first (avoid hardcoding text deep in components — keep copy in a simple content object/file per section).
- **No CMS required for v1** — content can be hardcoded in a typed content file (e.g. `content/pillars.ts`) so it's easy to edit later without touching layout code.

---

## 8. What NOT to do

- No SaaS-style pricing table with checkmarks and "Most Popular" ribbon.
- No sharp `.99` charm pricing (that's intentionally used on the separate consumer-facing Shalom Thailand tourist site — round numbers here).
- No bright discount badges, countdown timers, or urgency copy.
- No stock icon sets (Font Awesome default, generic flat business-people illustrations).
- No more than one accent color used as a fill at a time.
- No auto-playing image carousels or aggressive scroll-jacking animation.
- Don't show all 12 raw categories × 4 tiers as one long list — always the 5-pillar curation from §4.

---

## 9. First deliverable scope

Build the single-page homepage exactly per §3–§6 with placeholder imagery (clearly marked), plus the `/contact` page. Use realistic placeholder copy where marked, but the pricing figures in §4 are real and should be used as-is. Confirm the design system (§2) is applied consistently before adding any further pages.
