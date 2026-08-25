import { EmailNotificationProvider } from "./email";
import { LineNotificationProvider } from "./line";
import type { NotificationProvider } from "./types";

// Email is the default so launch isn't blocked on setting up the LINE
// Messaging API channel. Set NOTIFICATION_PROVIDER=line once
// LINE_CHANNEL_ACCESS_TOKEN and LINE_TARGET_ID are configured.
export const notificationProvider: NotificationProvider =
  process.env.NOTIFICATION_PROVIDER === "line"
    ? new LineNotificationProvider()
    : new EmailNotificationProvider();

export type { NotificationProvider, QuoteRequestDetails } from "./types";
