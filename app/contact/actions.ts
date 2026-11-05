"use server";

import { notificationProvider } from "@/lib/notifications";
import { getCategory } from "@/content/catalog";
import { DELIVERY_FAILED, validateLeadFields } from "@/lib/validation/contact";

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

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageResult> {
  // Honeypot: a field hidden from people but not from form-filling bots.
  // Accepted without sending, so the bot gets no signal that it was caught.
  // Nothing about the submission is logged - only that one was dropped.
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

  const invalid = validateLeadFields({ name, company, email, phone, message });
  if (invalid) return { ok: false, error: invalid };

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
