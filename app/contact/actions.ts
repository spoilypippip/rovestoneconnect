"use server";

import { notificationProvider } from "@/lib/notifications";
import { getCategory } from "@/content/catalog";
import { contactInfo } from "@/content/site";

export type ContactMessageInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  // An active category slug, or "" for "not specified".
  service: string;
  message: string;
  // Honeypot - see below. Real submissions always leave this empty.
  website: string;
};

export type ContactMessageResult = { ok: true } | { ok: false; error: string };

// Long enough for any genuine enquiry, short enough that a form post can't
// be used to push an unbounded payload into our team's inbox.
const MAX_LENGTH = {
  name: 100,
  company: 120,
  email: 200,
  phone: 40,
  message: 2000,
} as const;

// Deliberately loose: the only thing worth rejecting here is input that
// clearly isn't an address at all. Anything stricter starts refusing valid
// addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DELIVERY_FAILED = `Sorry - we couldn't send your message just now. Please email us directly at ${contactInfo.email} and we'll pick it up from there.`;

function tooLong(label: string, limit: number): string {
  return `${label} must be ${limit} characters or fewer.`;
}

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageResult> {
  // Honeypot: a field hidden from people but not from form-filling bots.
  // Accepted without sending, so the bot gets no signal that it was caught.
  // Nothing is logged about the submission itself - only that one was
  // dropped.
  if (input.website.trim()) {
    console.warn("[contact] Dropped a submission with the honeypot field filled.");
    return { ok: true };
  }

  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const message = input.message.trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (name.length > MAX_LENGTH.name) return { ok: false, error: tooLong("Name", MAX_LENGTH.name) };
  if (company.length > MAX_LENGTH.company) {
    return { ok: false, error: tooLong("Company", MAX_LENGTH.company) };
  }
  if (email.length > MAX_LENGTH.email) {
    return { ok: false, error: tooLong("Email", MAX_LENGTH.email) };
  }
  if (phone.length > MAX_LENGTH.phone) {
    return { ok: false, error: tooLong("Phone", MAX_LENGTH.phone) };
  }
  if (message.length > MAX_LENGTH.message) {
    return { ok: false, error: tooLong("Message", MAX_LENGTH.message) };
  }

  // The dropdown only offers active categories; anything else reached us by
  // a hand-made request, including the slug of a category that's currently
  // hidden from sale.
  const service = input.service.trim();
  const category = service ? getCategory(service) : undefined;
  if (service && category?.visibility !== "active") {
    return { ok: false, error: "Please choose a service from the list." };
  }

  const result = await notificationProvider.notifyContactMessage({
    name,
    company: company || null,
    email,
    phone: phone || null,
    serviceSlug: category?.slug ?? null,
    serviceName: category?.name ?? null,
    message,
  });

  if (!result.ok) {
    // The customer gets a plain failure, never a "thank you" for a message
    // that was never delivered.
    console.error(`[contact] Could not notify the team: ${result.reason}.`);
    return { ok: false, error: DELIVERY_FAILED };
  }

  return { ok: true };
}
