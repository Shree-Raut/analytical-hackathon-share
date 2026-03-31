/**
 * Notification Channel — Stub Implementation
 *
 * Dispatches conflict notifications to external channels (Slack, email).
 * This module ships a **stub** channel that logs to the console;
 * real adapters are swapped in once the channel preference is decided
 * (design.md §9, open question #2).
 *
 * The notification payload includes everything RM-5 requires: metric
 * name, both report sources, and a side-by-side diff of the logic.
 *
 * Requirements: RM-5, AC-DP-3
 * Design ref:   design.md §7.1 (Conflict detection), §7.2 (Retry policy)
 */

import type { NotificationChannel, ConflictNotification } from '../types';

// ---------------------------------------------------------------------------
// Stub channel — logs to console, always succeeds
// ---------------------------------------------------------------------------

/**
 * A no-op notification channel used during development and testing.
 * Records dispatched notifications in an internal buffer so tests can
 * inspect them, and logs each notification to the console.
 *
 * Replace with a real Slack/email adapter when the channel is chosen.
 */
export class StubNotificationChannel implements NotificationChannel {
  readonly channelName = 'stub';

  /** Buffer of all notifications sent through this channel. */
  public readonly sent: ConflictNotification[] = [];

  /**
   * "Sends" a notification by appending it to the internal buffer
   * and logging a summary to the console.
   *
   * @param notification - The conflict details to send
   * @returns Always resolves to true (stub never fails)
   */
  async send(notification: ConflictNotification): Promise<boolean> {
    this.sent.push(notification);

    console.log(
      `[STUB NOTIFICATION] Conflict detected for metric "${notification.metricName}" ` +
        `between reports ${notification.reportAId} and ${notification.reportBId}`
    );

    return true;
  }

  /** Clears the notification buffer. Useful between test runs. */
  clear(): void {
    this.sent.length = 0;
  }
}
