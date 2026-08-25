"use server";

import { notificationProvider } from "@/lib/notifications";

export type QuoteRequestInput = {
  itemId: string | null;
  itemName: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

export async function submitQuoteRequest(
  input: QuoteRequestInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.name.trim() || !input.email.trim() || !input.phone.trim()) {
    return { ok: false, error: "Name, email, and phone are required." };
  }

  await notificationProvider.notifyQuoteRequest({
    itemId: input.itemId,
    itemName: input.itemName,
    name: input.name,
    company: input.company || null,
    email: input.email,
    phone: input.phone,
    message: input.message,
  });

  return { ok: true };
}
