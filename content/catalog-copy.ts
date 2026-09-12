// Hand-maintained English copy for the catalog parsed from the pricing
// workbook (data/catalog.json). The workbook's own descriptions are Thai —
// this file supplies the English display copy for the (currently
// English-only) site, keyed by the same stable item/category ids so it
// survives re-running `npm run catalog:import`.

// The workbook's `unit` field (e.g. "ต่อแพ็ค (7 วัน)") is also Thai and,
// unlike name/description, isn't keyed by item id - only ~20 distinct
// strings recur across the whole catalog, so this maps the raw value
// directly.
export const unitCopy: Record<string, string> = {
  "ต่อแพ็ค (7 วัน)": "per package (7 days)",
  "ต่อแพ็ค (14 วัน)": "per package (14 days)",
  "ต่อแพ็ค (30 วัน)": "per package (30 days)",
  "ต่อแพ็ค (90 วัน)": "per package (90 days)",
  "ต่อแพ็ก": "per package",
  "ต่อปี (≈825 บาท/เดือน)": "per year (≈฿825/month)",
  "ต่อปี (≈1,075 บาท/เดือน)": "per year (≈฿1,075/month)",
  "ต่อปี (≈2,490 บาท/เดือน)": "per year (≈฿2,490/month)",
  "ต่อปี (≈4,583 บาท/เดือน)": "per year (≈฿4,583/month)",
  "ต่อปี (แบ่งจ่ายไตรมาสละ 2,500 บาทได้)": "per year (payable quarterly at ฿2,500)",
  "ต่อปี": "per year",
  "ต่อครั้ง": "per occurrence",
  "ต่อครั้ง (บวกจากแพ็คปรึกษาที่เลือก)": "per occurrence (added on top of your chosen advisory package)",
  "ต่อหน้า": "per page",
  "ต่อวัน": "per day",
  "ต่อเดือน": "per month",
  "ต่อเคส": "per case",
  "ต่อทริป": "per trip",
  "ต่อคน": "per person",
  "ต่อคน (โปรแกรม 7 วัน)": "per person (7-day program)",
  "ต่อคน (โปรแกรม 14 วัน)": "per person (14-day program)",
  "ต่อคอร์ส (30 วัน)": "per course (30 days)",
  "ต่อกลุ่ม": "per group",
  "ต่อรายการ": "per item",
};

export const categoryCopy: Record<string, { tagline: string }> = {
  "local-information": {
    tagline:
      "On-call answers to the everyday questions that come up living or working in Thailand, from a Thai-speaking advisor.",
  },
  translation: {
    tagline:
      "Certified document translation and interpretation, from a single page to a full day of in-person work.",
  },
  "finding-trustworthy-services": {
    tagline:
      "Vetted introductions to service providers, with price comparisons and due diligence before you commit.",
  },
  "accommodation-questions": {
    tagline: "Independent guidance on location, lease terms, and viewings before you sign.",
  },
  "travel-arrangements": {
    tagline: "Trip planning and in-country support, for a single trip or a full, changeable itinerary.",
  },
  relocation: {
    tagline: "Advisory support through a move to Thailand, from planning through arrival.",
  },
  "local-culture": {
    tagline: "Thai language instruction and business-culture briefings for individuals and teams.",
  },
  "business-support": {
    tagline: "Advisory for company registration, market entry, and BOI processes.",
  },
  "booking-coordination": {
    tagline: "Restaurant, activity, and reservation coordination, including VIP bookings.",
  },
  "vip-concierge": {
    tagline: "Dedicated concierge support with fast response times and in-person assistance.",
  },
  "community-connection": {
    tagline: "Access to a community of residents and expats, with events and partner discounts.",
  },
  "visa-extension-advisory": {
    tagline: "Independent advisory through a full visa or extension cycle, from documents to follow-up.",
  },
};

export const itemCopy: Record<string, { name: string; description: string }> = {
  // 1. Local information
  "local-information--7-day": {
    name: "Rapid Advisory",
    description:
      "Unlimited chat Q&A for 7 days, plus one 30-minute video call with a Thailand-based advisor.",
  },
  "local-information--14-day": {
    name: "Focused Engagement",
    description: "Unlimited chat for 14 days, plus two video calls.",
  },
  "local-information--30-day": {
    name: "Standard Retainer",
    description:
      "Unlimited chat and video calls for 30 days, plus written summaries on request (banking, insurance, transport, initial visa questions).",
  },
  "local-information--1-year": {
    name: "Annual Partnership",
    description:
      "A dedicated advisor on call all year, plus in-depth research support (including initial visa and healthcare coordination).",
  },
  "local-information--addon-1": {
    name: "In-Person Errand Support",
    description: "In-person accompaniment to open a bank account, buy a SIM card, or set up utilities.",
  },

  // 2. Translation
  "translation--7-day": {
    name: "Rapid Advisory",
    description: "Credit for one page of standard document translation, plus advice on what needs translating.",
  },
  "translation--14-day": {
    name: "Focused Engagement",
    description: "Credit for three pages of standard translation, plus 30 minutes of phone or video interpretation.",
  },
  "translation--30-day": {
    name: "Standard Retainer",
    description:
      "Five pages of standard translation credit per month, plus one hour of phone or video interpretation. Unused credit does not roll over.",
  },
  "translation--1-year": {
    name: "Annual Partnership",
    description:
      "70 pages of standard translation credit per year (about 5.8 pages a month), plus 6 hours of phone or video interpretation annually.",
  },
  "translation--addon-1": {
    name: "Additional Certified Translation",
    description: "Certified or technical translation (official documents, contracts, medical certificates) beyond your plan's quota.",
  },
  "translation--addon-2": {
    name: "Full-Day In-Person Interpreting",
    description: "A full day of in-person consecutive interpretation (hospital visits, government offices, business negotiations).",
  },

  // 3. Finding trustworthy services
  "finding-trustworthy-services--7-day": {
    name: "Rapid Advisory",
    description: "Unlimited vetted service-provider recommendations for one matter, within 7 days.",
  },
  "finding-trustworthy-services--14-day": {
    name: "Focused Engagement",
    description: "Recommendations and price comparisons for one matter, plus introductions handled on your behalf.",
  },
  "finding-trustworthy-services--30-day": {
    name: "Standard Retainer",
    description:
      "Shortlists of 3-5 vetted providers with price comparisons and introductions, for as many matters as you need within 30 days.",
  },
  "finding-trustworthy-services--1-year": {
    name: "Annual Partnership",
    description: "A standing advisor for sourcing trustworthy providers, for unlimited matters throughout the year.",
  },
  "finding-trustworthy-services--addon-1": {
    name: "In-Depth Due Diligence",
    description: "In-depth due diligence before you sign or pay (companies, service providers, property deals, business partners).",
  },
  "finding-trustworthy-services--addon-2": {
    name: "Contract Signing Support",
    description: "Scheduling, in-person accompaniment, and on-site support through contract signing.",
  },

  // 4. Accommodation questions
  "accommodation-questions--7-day": {
    name: "Rapid Advisory",
    description: "Unlimited guidance on neighbourhoods, plus an assessment of whether a listing or landlord looks trustworthy.",
  },
  "accommodation-questions--14-day": {
    name: "Focused Engagement",
    description: "Unlimited location guidance, plus review of one lease agreement.",
  },
  "accommodation-questions--30-day": {
    name: "Standard Retainer",
    description: "Unlimited location questions, review of two lease agreements, and guidance on negotiating terms.",
  },
  "accommodation-questions--1-year": {
    name: "Annual Partnership",
    description:
      "A year-round housing advisor for long-term tenants who may move, renew, or run into issues during the year.",
  },
  "accommodation-questions--addon-1": {
    name: "Property Search & Viewings",
    description: "Search, shortlisting, and accompanied viewings (up to 5 properties), plus lease review.",
  },
  "accommodation-questions--addon-2": {
    name: "Full-Service Lease Execution",
    description: "Price negotiation, lease execution, utility and internet setup, and move-in handover.",
  },

  // 5. Travel arrangements
  "travel-arrangements--7-day": {
    name: "Rapid Advisory",
    description:
      "Itinerary planning and unlimited questions on accommodation and transport (you book directly), for the 7 days before travel.",
  },
  "travel-arrangements--14-day": {
    name: "Focused Engagement",
    description: "Planning, initial booking assistance, and support throughout a 14-day trip.",
  },
  "travel-arrangements--30-day": {
    name: "Standard Retainer",
    description: "Support for a long or multi-destination trip, with unlimited itinerary changes over 30 days.",
  },
  "travel-arrangements--1-year": {
    name: "Annual Partnership",
    description: "A planning advisor for unlimited trips, for frequent travelers in Thailand throughout the year.",
  },
  "travel-arrangements--addon-1": {
    name: "Full Booking Management",
    description: "Full booking management (accommodation, transport, tours, domestic tickets), plus support during the trip.",
  },
  "travel-arrangements--addon-2": {
    name: "Custom Itinerary Design",
    description: "A fully custom itinerary with a dedicated coordinator and 24/7 Hebrew-language support throughout the trip.",
  },
  "travel-arrangements--addon-3": {
    name: "Airport Fast-Track",
    description: "Fast-track immigration and airport transfer.",
  },

  // 6. Relocation
  "relocation--7-day": {
    name: "Rapid Advisory",
    description: "Rapid advisory for the decision phase of a move to Thailand, unlimited questions within 7 days.",
  },
  "relocation--14-day": {
    name: "Focused Engagement",
    description: "Full relocation planning and a complete step-by-step checklist, within 14 days.",
  },
  "relocation--30-day": {
    name: "Standard Retainer",
    description: "Advisory support through a full month of relocating to Thailand (advice only, not hands-on execution).",
  },
  "relocation--1-year": {
    name: "Annual Partnership",
    description: "Year-round relocation advisory for families or companies moving staff over time.",
  },
  "relocation--addon-1": {
    name: "Arrival Package",
    description: "An arrival package: SIM card, bank account opening, utilities setup, and a half-day orientation.",
  },
  "relocation--addon-2": {
    name: "Full Relocation Package",
    description: "Everything in the Arrival Package, plus housing search, visa coordination through a licensed agent, and school recommendations.",
  },
  "relocation--addon-3": {
    name: "Premium Family Relocation",
    description: "A complete family relocation: schooling, long-stay visa coordination, and 90 days of continued support.",
  },

  // 7. Local culture
  "local-culture--7-day": {
    name: "Rapid Advisory",
    description: "A rapid cultural-orientation program (self-paced material plus one live session).",
  },
  "local-culture--14-day": {
    name: "Focused Engagement",
    description: "A basic Thai language and culture course, with two live sessions.",
  },
  "local-culture--30-day": {
    name: "Standard Retainer",
    description: "A 10-hour everyday Thai language course, plus a Thai business-culture briefing.",
  },
  "local-culture--1-year": {
    name: "Annual Partnership",
    description: "An ongoing Thai language program with a quarterly culture workshop (4 sessions a year).",
  },
  "local-culture--addon-1": {
    name: "Cultural Orientation Workshop",
    description: "A one-off group workshop on Thai cultural basics: etiquette, the wai greeting, taboos, and temple conduct.",
  },

  // 8. Business support
  "business-support--7-day": {
    name: "Rapid Advisory",
    description: "Rapid advisory to assess business feasibility, unlimited questions within 7 days.",
  },
  "business-support--14-day": {
    name: "Focused Engagement",
    description: "Full market-entry planning and business-structure advisory, within 14 days.",
  },
  "business-support--30-day": {
    name: "Standard Retainer",
    description: "Advisory through a full month of decision-making and business setup (registration execution not included).",
  },
  "business-support--1-year": {
    name: "Annual Partnership",
    description: "A year-round business advisor for entrepreneurs, unlimited questions.",
  },
  "business-support--addon-1": {
    name: "Company Registration",
    description: "Company registration coordinated through a licensed firm, plus corporate bank account opening.",
  },
  "business-support--addon-2": {
    name: "BOI & Work Permit Advisory",
    description: "BOI advisory, work permit processing, and 6 months of ongoing liaison support.",
  },
  "business-support--addon-3": {
    name: "Business Culture Workshop",
    description: "A half-day Thai business-culture workshop for your team.",
  },

  // 9. Booking coordination
  "booking-coordination--7-day": {
    name: "Rapid Advisory",
    description: "Unlimited restaurant, activity, and spa bookings within 7 days.",
  },
  "booking-coordination--14-day": {
    name: "Focused Engagement",
    description: "Unlimited bookings for 14 days.",
  },
  "booking-coordination--30-day": {
    name: "Standard Retainer",
    description: "Unlimited multi-category bookings (restaurants, tours, transport, spa), plus one VIP reservation.",
  },
  "booking-coordination--1-year": {
    name: "Annual Partnership",
    description: "Unlimited bookings all year, for residents or frequent travelers in Thailand.",
  },
  "booking-coordination--addon-1": {
    name: "Additional VIP Reservations",
    description: "Additional VIP reservations (superclub tables, event seating, hard-to-book restaurants) beyond your plan's quota.",
  },

  // 10. VIP concierge
  "vip-concierge--7-day": {
    name: "Rapid Advisory",
    description:
      "A trial of dedicated concierge service, with chat support 12 hours a day, 7 days a week; in-person assistance billed separately by the hour.",
  },
  "vip-concierge--14-day": {
    name: "Focused Engagement",
    description: "Dedicated concierge service with video calls and a 15-minute response time.",
  },
  "vip-concierge--30-day": {
    name: "Standard Retainer",
    description: "Dedicated concierge service with 12/7 chat support; in-person assistance billed separately by the hour.",
  },
  "vip-concierge--1-year": {
    name: "Annual Partnership",
    description: "Dedicated concierge service all year, unlimited, at the same level as the 30-day plan.",
  },
  "vip-concierge--addon-1": {
    name: "Upgrade to Standard",
    description:
      "Adds video calls, a 15-minute response time, and discounted in-person assistance (billed monthly on top of your core plan).",
  },
  "vip-concierge--addon-2": {
    name: "Upgrade to Premium",
    description: "A senior concierge, a 5-minute response time, and 10 free hours of in-person assistance a month.",
  },
  "vip-concierge--addon-3": {
    name: "Personal Assistant / Fixer",
    description: "An in-person personal assistant or fixer (half day, 4 hours, or full day, 10 hours).",
  },

  // 11. Community connection
  "community-connection--7-day": {
    name: "Rapid Advisory",
    description: "Community group access, an events calendar, and basic partner discounts (trial).",
  },
  "community-connection--14-day": {
    name: "Focused Engagement",
    description: "Community group access, an events calendar, and basic partner discounts.",
  },
  "community-connection--30-day": {
    name: "Standard Retainer",
    description: "Community group access, an events calendar, and basic partner discounts.",
  },
  "community-connection--1-year": {
    name: "Annual Partnership",
    description: "Adds premium discounts, members-only events, a membership card, and personal introductions.",
  },
  "community-connection--addon-1": {
    name: "Premium Family & Business Package",
    description: "A family package with all events included, plus business-network introductions.",
  },

  // 12. Visa extension advisory
  "visa-extension-advisory--7-day": {
    name: "Rapid Advisory",
    description:
      "For a visa nearing expiry or a decision needed shortly after arrival: unlimited priority chat (2-hour response), one 30-minute video call with a Thailand-based advisor, and a case-specific document checklist.",
  },
  "visa-extension-advisory--14-day": {
    name: "Focused Engagement",
    description:
      "Covers preparing and filing one tourist-visa extension or amnesty cycle: unlimited chat and calls, two video calls, one document review before filing, and a written step-by-step plan.",
  },
  "visa-extension-advisory--30-day": {
    name: "Standard Retainer",
    description:
      "Covers a full extension cycle for a tourist visa, amnesty, or Non-O, from document preparation through follow-up, including troubleshooting along the way: unlimited chat and calls, two rounds of document review, help preparing for your Immigration appointment, and status tracking through to completion.",
  },
  "visa-extension-advisory--90-day": {
    name: "90-Day Reporting Cycle",
    description:
      "For Non-Immigrant O holders who must report every 90 days and plan their next extension: everything in the Standard Retainer, plus a 90-day reporting reminder and an eligibility/document review before your next extension.",
  },
  "visa-extension-advisory--1-year": {
    name: "Annual Partnership",
    description:
      "For year-to-year Non-O holders (retirement, marriage, work) or Long Stay visa holders managing a full year: a standing advisor all year, 90-day reporting reminders each cycle, document review before your annual extension, and a 15% discount on upgrading to full-service execution at any point during the year.",
  },
  "visa-extension-advisory--addon-1": {
    name: "Filing: Tourist Visa Extension",
    description: "We file on your behalf or accompany you to Immigration, per visit. Excludes the ฿1,900 government fee, paid directly to Immigration.",
  },
  "visa-extension-advisory--addon-2": {
    name: "Filing: 90-Day Report",
    description: "We file your 90-day report (TM.47) on your behalf, in person or online, per filing. No government fee.",
  },
  "visa-extension-advisory--addon-3": {
    name: "Filing: Annual Non-O Extension",
    description:
      "Document coordination and filing for your annual Non-O extension (retirement, marriage, work), through a licensed agent. Excludes the ฿1,900 government fee and other costs (health insurance, etc.), paid at actual cost.",
  },
  "visa-extension-advisory--addon-4": {
    name: "Filing: Long-Stay Visa (O-A / O-X / LTR)",
    description:
      "Document coordination and filing for a long-stay visa (O-A 1 year, O-X 10 years, or LTR), through a licensed agent. Excludes government fees and health insurance, paid at actual cost.",
  },
  "visa-extension-advisory--addon-5": {
    name: "Filing: Destination Thailand Visa",
    description:
      "Document coordination and filing for the Destination Thailand Visa (DTV). Excludes the government fee of approximately ฿10,000, paid at actual cost.",
  },
};
