/**
 * Privacy policy copy, kept out of the page component so a Thai version can
 * be added later without touching layout: translate a second
 * `PrivacyDocument` and add it under "TH" in `privacyPolicy` below.
 *
 * Everything here describes what the code in this repository actually does
 * (see the notes beside each section). Anything that is a business or legal
 * decision - retention periods, the lawful basis for each purpose, who is
 * named as the controller - is a `todo` block instead of invented text, and
 * renders visibly on the page so it can't ship unnoticed.
 */

export type PrivacyLocale = "EN" | "TH";

export type PrivacyBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  // Renders highlighted on the page: a decision the business still has to make.
  | { type: "todo"; text: string };

export type PrivacySection = {
  id: string;
  heading: string;
  blocks: PrivacyBlock[];
};

export type PrivacyDocument = {
  eyebrow: string;
  title: string;
  effectiveDateLabel: string;
  effectiveDate: PrivacyBlock;
  intro: PrivacyBlock[];
  sections: PrivacySection[];
};

const en: PrivacyDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy.",
  effectiveDateLabel: "Effective date",
  effectiveDate: {
    type: "todo",
    text: "TODO: effective date - set this to the date this policy is published, and update it whenever the policy changes.",
  },
  intro: [
    {
      type: "todo",
      text: "TODO: this is an unreviewed draft prepared from what the website's code actually does. It is not legal advice and must be reviewed by a Thai PDPA practitioner before publication.",
    },
    {
      type: "paragraph",
      text: "This policy explains what personal data RoveStone Connect collects through this website, why we collect it, who else handles it, and the rights you have over it under Thailand's Personal Data Protection Act B.E. 2562 (2019) (“PDPA”).",
    },
  ],
  sections: [
    {
      id: "controller",
      heading: "Who is responsible for your data",
      blocks: [
        {
          type: "paragraph",
          text: "The data controller for this website is:",
        },
        {
          type: "todo",
          text: "TODO: registered legal name of the company that owns RoveStone Connect.",
        },
        {
          type: "todo",
          text: "TODO: registered office address.",
        },
        {
          type: "todo",
          text: "TODO: email address for personal data requests (this is the address used in the “Your rights” and “Contact” sections below).",
        },
        {
          type: "todo",
          text: "TODO: confirm whether a Data Protection Officer is required under PDPA section 41 for this business and, if so, name them and give their contact details.",
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        {
          type: "paragraph",
          text: "We only collect what you give us, plus what is technically necessary to keep you signed in and to process an order. We do not run advertising or analytics trackers on this site.",
        },

        { type: "subheading", text: "Account information" },
        {
          type: "paragraph",
          text: "If you create an account, we store your email address, your first and last name, and a securely hashed version of your password. Accounts are managed for us by Supabase Auth.",
        },
        {
          type: "paragraph",
          text: "If you sign in with Google instead, Google provides us with the name, email address, and profile picture on your Google account, and these are stored with your account record.",
        },

        { type: "subheading", text: "Orders" },
        {
          type: "paragraph",
          text: "When you place an order we store the name, company (optional), email address, and phone number you enter at checkout, the language you prefer to be contacted in (English or Thai), the services and quantities ordered, the prices and currency charged, the payment method used, the order's status, and the date and time the order was created.",
        },

        { type: "subheading", text: "Quote requests" },
        {
          type: "paragraph",
          text: "When you request a quote we send your name, company, email address, phone number, message, and the service you asked about to our team so a person can reply. These requests are delivered as a notification rather than saved to our order database.",
        },

        { type: "subheading", text: "Payment information" },
        {
          type: "paragraph",
          text: "Card payments are handled entirely by Stripe on Stripe's own payment page. Your card number never reaches this website and we never store it. We receive only the result of the payment, which we record against your order. If you pay by bank transfer or PromptPay instead, we record that you have told us the transfer was made; a member of our team then verifies it manually.",
        },

        { type: "subheading", text: "Information stored in your browser" },
        {
          type: "paragraph",
          text: "Your shopping cart is stored in your own browser (localStorage), not on our servers, under a key tied to your account. A cart is discarded automatically seven days after you last changed it. Your browser also stores which currency you have chosen to see prices in, and a marker recording that a cart was emptied after an order was placed, so it is not emptied twice.",
        },
        {
          type: "paragraph",
          text: "We use cookies set by Supabase to keep you signed in. See “Cookies and local storage” below.",
        },
        {
          type: "todo",
          text: "TODO: the contact form on the Contact page currently does nothing with what you type - it is not sent anywhere and not stored. Either wire it up (and then describe it here) or remove the form; this policy must not claim we handle data we do not, nor stay silent about data we do.",
        },
        {
          type: "todo",
          text: "TODO: confirm what our hosting provider (Vercel) and our database provider (Supabase) log automatically - typically IP address, browser user agent, and requested URL - and for how long, then describe it here.",
        },
      ],
    },
    {
      id: "why-we-use-it",
      heading: "Why we use it, and our lawful basis",
      blocks: [
        {
          type: "paragraph",
          text: "We use the personal data described above to:",
        },
        {
          type: "list",
          items: [
            "create and maintain your account and keep you signed in;",
            "take, process, and fulfil your order, including taking payment and confirming it;",
            "contact you about your order or your quote request, in the language you selected;",
            "keep records of the transactions we have entered into.",
          ],
        },
        {
          type: "todo",
          text: "TODO: a lawful basis under PDPA section 24 must be recorded for each purpose above (for example performance of a contract, legitimate interest, or consent). This is a legal determination - have it confirmed and written in, purpose by purpose.",
        },
        {
          type: "todo",
          text: "TODO: confirm whether any processing here relies on consent. If it does, this policy must describe how consent is obtained and how it can be withdrawn, and the website needs a matching consent step.",
        },
        {
          type: "paragraph",
          text: "We do not sell personal data, and we do not use it for advertising or profiling.",
        },
      ],
    },
    {
      id: "who-receives-it",
      heading: "Who else handles your data",
      blocks: [
        {
          type: "paragraph",
          text: "We use the following service providers. Each receives only what it needs to do its job:",
        },
        {
          type: "list",
          items: [
            "Supabase - stores our database of accounts and orders, and runs sign-in. Our database is hosted in the ap-northeast-2 region (Seoul, South Korea).",
            "Vercel - hosts and serves this website, and therefore processes every request made to it.",
            "Stripe - takes card payments on its own hosted payment page. Stripe receives your email address, the order reference, and the services and amounts being charged.",
            "Resend - delivers the notification emails that tell our team a new order or quote request has arrived. Those notifications contain your name, email address, phone number, company, and what you ordered or asked about.",
            "LINE - where enabled, the same internal notifications are pushed to our team through the LINE Messaging API. Separately, the order confirmation page offers you a link that opens a pre-filled message to our LINE account; that message is only sent if you choose to send it.",
            "Google - where you choose to sign in with Google, Google authenticates you and returns your basic profile to us.",
          ],
        },
        {
          type: "todo",
          text: "TODO: confirm this list is complete and current before publishing, and confirm that a data processing agreement is in place with each provider as PDPA section 40 requires.",
        },
      ],
    },
    {
      id: "international-transfers",
      heading: "Sending data outside Thailand",
      blocks: [
        {
          type: "paragraph",
          text: "Our database and account records are stored in South Korea (Supabase, ap-northeast-2 region). Our hosting, payment, email, messaging, and sign-in providers listed above are international services and may process your data in countries outside Thailand.",
        },
        {
          type: "paragraph",
          text: "This means personal data you give us is transferred out of Thailand.",
        },
        {
          type: "todo",
          text: "TODO: PDPA sections 28 and 29 require a lawful mechanism for transferring personal data abroad (for example an adequacy finding, appropriate safeguards, or a statutory exception). Record which mechanism is relied on for each provider, and state it here.",
        },
        {
          type: "todo",
          text: "TODO: confirm the destination country for every provider listed above, not just Supabase, and whether the choice of region is fixed or configurable.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        {
          type: "paragraph",
          text: "Your shopping cart is held in your own browser and is discarded automatically seven days after you last changed it. You can clear it yourself at any time from the cart page.",
        },
        {
          type: "todo",
          text: "TODO: retention period for order records (name, contact details, and what was ordered). Thai tax and accounting law sets minimums for transaction records - have the applicable period confirmed and state it here.",
        },
        {
          type: "todo",
          text: "TODO: retention period for account records after an account is closed or becomes inactive.",
        },
        {
          type: "todo",
          text: "TODO: retention period for quote requests and the notification emails and LINE messages that carry them.",
        },
        {
          type: "todo",
          text: "TODO: there is currently no routine in the code that deletes or anonymises old records - deletion would be manual. Decide whether that is acceptable for the periods above, and build it if it is not.",
        },
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        {
          type: "paragraph",
          text: "Under the PDPA you have the right to:",
        },
        {
          type: "list",
          items: [
            "access the personal data we hold about you, and request a copy of it;",
            "have inaccurate or incomplete data corrected;",
            "have your data deleted;",
            "object to our processing of your data;",
            "withdraw your consent, where we rely on consent, at any time;",
            "lodge a complaint with the Office of the Personal Data Protection Committee (PDPC) if you believe we have handled your data unlawfully.",
          ],
        },
        {
          type: "paragraph",
          text: "To exercise any of these rights, contact us at the email address given above.",
        },
        {
          type: "todo",
          text: "TODO: the PDPA also provides rights to data portability and to restriction of processing. Confirm with counsel whether to list them here as well.",
        },
        {
          type: "todo",
          text: "TODO: state how long we will take to respond to a request, and what identification we will ask for before acting on one.",
        },
        {
          type: "todo",
          text: "TODO: there is no self-service way for a customer to view or delete their own data in the website today - requests would be handled manually. Confirm that this is the intended process.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and local storage",
      blocks: [
        {
          type: "paragraph",
          text: "This website sets cookies only to keep you signed in. They are placed by Supabase, our authentication provider, and are necessary for the site to work once you have an account - without them you would be signed out on every page. We do not use advertising, analytics, or tracking cookies.",
        },
        {
          type: "paragraph",
          text: "We also use your browser's local storage, which stays on your device and is never sent to us, for:",
        },
        {
          type: "list",
          items: [
            "your shopping cart, stored against your account and discarded seven days after its last change;",
            "the currency you have chosen to see prices in;",
            "a marker noting that your cart was emptied after an order, so it is not emptied again.",
          ],
        },
        {
          type: "paragraph",
          text: "You can clear cookies and local storage at any time through your browser settings. Doing so will sign you out and empty your cart.",
        },
        {
          type: "todo",
          text: "TODO: decide whether a cookie consent banner is required. Strictly necessary cookies generally do not need consent, but confirm this is still the case if analytics or marketing tools are added later.",
        },
      ],
    },
    {
      id: "security",
      heading: "How we protect your data",
      blocks: [
        {
          type: "paragraph",
          text: "Our database is reachable only from our own server code, never from your browser, and card details are handled by Stripe rather than by us.",
        },
        {
          type: "todo",
          text: "TODO: describe the organisational measures actually in place - who on the team can access customer data, how that access is granted and revoked, and what happens if there is a data breach. PDPA section 37 requires a breach notification process, including notifying the PDPC within 72 hours.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        {
          type: "paragraph",
          text: "If we change this policy we will update the effective date at the top of this page.",
        },
        {
          type: "todo",
          text: "TODO: decide whether material changes will also be notified to account holders by email, and say so here if they will.",
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      blocks: [
        {
          type: "paragraph",
          text: "For any question about this policy, or to exercise any of the rights described above, contact us at:",
        },
        {
          type: "todo",
          text: "TODO: email address for personal data requests (same as in “Who is responsible for your data” above).",
        },
        {
          type: "todo",
          text: "TODO: registered office address, and a postal address for written requests if it differs.",
        },
        {
          type: "paragraph",
          text: "You may also complain to the Office of the Personal Data Protection Committee.",
        },
      ],
    },
  ],
};

// TODO: add a "TH" document here once the Thai translation is signed off -
// the page renders whichever document it is handed, so no layout changes
// are needed.
export const privacyPolicy = { EN: en } satisfies Partial<
  Record<PrivacyLocale, PrivacyDocument>
>;
