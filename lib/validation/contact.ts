import { contactInfo } from "@/content/site";

/**
 * Shared by the two public lead forms - the contact form and the quote
 * request - so their rules can't drift apart, and so the notification layer
 * can re-check an address before putting it in an outgoing header.
 */

// Long enough for any genuine enquiry, short enough that a form post can't
// be used to push an unbounded payload into our team's inbox.
export const MAX_LENGTH = {
  name: 100,
  company: 120,
  email: 200,
  phone: 40,
  message: 2000,
} as const;

// Deliberately loose: the only thing worth rejecting here is input that
// clearly isn't an address at all - anything stricter starts refusing valid
// addresses. The angle brackets are the exception, and they matter: a lead
// form's address is used as the reply-to on the alert we send ourselves.
export const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// Shown when the alert to the team could not be delivered. Never tell the
// customer their message arrived when it didn't - give them an address that
// definitely works instead.
export const DELIVERY_FAILED = `Sorry - we couldn't send your message just now. Please email us directly at ${contactInfo.email} and we'll pick it up from there.`;

export function tooLong(label: string, limit: number): string {
  return `${label} must be ${limit} characters or fewer.`;
}

export type LeadContactFields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

/**
 * Format and length checks common to both lead forms. Expects values that
 * have already been trimmed. Returns the message to show the customer, or
 * null if everything passes.
 *
 * Which fields are *required* stays with each form: the quote request needs
 * a phone number and the contact form doesn't, and they word it differently.
 */
export function validateLeadFields(fields: LeadContactFields): string | null {
  if (!EMAIL_PATTERN.test(fields.email)) {
    return "Please enter a valid email address.";
  }
  if (fields.name.length > MAX_LENGTH.name) return tooLong("Name", MAX_LENGTH.name);
  if (fields.company.length > MAX_LENGTH.company) return tooLong("Company", MAX_LENGTH.company);
  if (fields.email.length > MAX_LENGTH.email) return tooLong("Email", MAX_LENGTH.email);
  if (fields.phone.length > MAX_LENGTH.phone) return tooLong("Phone", MAX_LENGTH.phone);
  if (fields.message.length > MAX_LENGTH.message) return tooLong("Message", MAX_LENGTH.message);
  return null;
}
