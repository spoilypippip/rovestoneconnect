"use server";

import { notificationProvider } from "@/lib/notifications";
import { getItem } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";
import { DELIVERY_FAILED, validateLeadFields } from "@/lib/validation/contact";

export type QuoteRequestInput = {
  // The service being asked about. Only the id travels from the browser -
  // its name is read from the catalog here, so the alert our team acts on
  // can't be relabelled by whoever posted the form.
  itemId: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  // Honeypot - see below. Real submissions always leave this empty.
  website: string;
};

export async function submitQuoteRequest(
  input: QuoteRequestInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Honeypot: a field hidden from people but not from form-filling bots.
  // Accepted without sending, so the bot gets no signal that it was caught.
  if (input.website.trim()) {
    console.warn("[quote-request] Dropped a submission with the honeypot field filled.");
    return { ok: true };
  }

  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const message = input.message.trim();

  if (!name || !email || !phone) {
    return { ok: false, error: "Name, email, and phone are required." };
  }

  const invalid = validateLeadFields({ name, company, email, phone, message });
  if (invalid) return { ok: false, error: invalid };

  // An id that isn't in the catalog is treated as no service at all rather
  // than passed through: the team would have nothing to look up either way.
  const itemId = input.itemId?.trim() || null;
  const item = itemId ? getItem(itemId) : undefined;
  const itemName = item ? (itemCopy[item.id]?.name ?? item.tierLabel) : null;

  const result = await notificationProvider.notifyQuoteRequest({
    itemId: item?.id ?? null,
    itemName,
    name,
    company: company || null,
    email,
    phone,
    message,
  });

  if (!result.ok) {
    // Same rule as the contact form: no "thank you" for a request nobody
    // received.
    console.error(`[quote-request] Could not notify the team: ${result.reason}.`);
    return { ok: false, error: DELIVERY_FAILED };
  }

  return { ok: true };
}
