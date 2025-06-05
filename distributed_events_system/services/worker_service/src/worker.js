import pino from "pino";
import { receiveMessages, deleteMessage } from "./queue.js";
import { getEventById, getProcessingRow, upsertProcessing } from "./db.js";
import { notify } from "./notifications/notifier.js";
import { isDoneCached, markDoneCached } from "./cache.js";
import { retryPolicy } from "./retry_policy.js";
import {
  eventsProcessed,
  eventsFailed,
  eventsDuplicateSkipped
} from "./metrics.js";

const log = pino({ level: process.env.LOG_LEVEL || "info" });

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

async function handleMessage(msg) {
  const body = parseBody(msg.Body);
  if (!body || !body.eventId) {
    log.warn({ messageId: msg.MessageId }, "invalid_message_body");
    return { delete: true };
  }

  const eventId = body.eventId;

  const cachedDone = await isDoneCached(eventId);
  if (cachedDone) {
    eventsDuplicateSkipped.inc();
    log.info({ eventId }, "duplicate_skip_cached");
    return { delete: true };
  }

  const existing = await getProcessingRow(eventId);
  if (existing && existing.status === "completed") {
    await markDoneCached(eventId);
    eventsDuplicateSkipped.inc();
    log.info({ eventId }, "duplicate_delivery_skip");
    return { delete: true };
  }

  const previousAttempts = existing?.attempt_count || 0;
  if (previousAttempts >= retryPolicy.maxAttempts) {
    log.error(
      { eventId, attempts: previousAttempts },
      "max_attempts_reached_marking_permanent_failure"
    );

    await upsertProcessing(
      eventId,
      "failed",
      previousAttempts,
      "max_attempts_reached"
    );

    eventsFailed.inc();
    return { delete: true };
  }

  const event = await getEventById(eventId);
  if (!event) {
    log.warn({ eventId }, "event_not_found_in_db");
    return { delete: true };
  }

  const attempt = previousAttempts + 1;
  await upsertProcessing(eventId, "processing", attempt, null);

  try {
    const result = await notify(event);

    await upsertProcessing(eventId, "completed", attempt, null);
    await markDoneCached(eventId);

    log.info(
      { eventId, attempt, channel: result?.channel },
      "event_processed"
    );

    eventsProcessed.inc();
    return { delete: true };
  } catch (err) {
    const msgText = err?.message || "unknown_error";
    await upsertProcessing(eventId, "failed", attempt, msgText);
    eventsFailed.inc();

    if (err && err.permanent) {
      log.error(
        { eventId, attempt, status: err.status },
        "permanent_failure_deleting_message"
      );
      return { delete: true };
    }

    if (attempt >= retryPolicy.maxAttempts) {
      log.error(
        { eventId, attempt },
        "final_attempt_failed_message_likely_heading_to_dlq"
      );
    }

    log.error(
      { eventId, attempt, status: err?.status },
      "transient_failure_will_retry"
    );

    return { delete: false };
  }
}

export async function runForever() {
  while (true) {
    const messages = await receiveMessages();

    if (messages.length === 0) {
      continue;
    }

    for (const msg of messages) {
      const result = await handleMessage(msg);

      if (result.delete && msg.ReceiptHandle) {
        await deleteMessage(msg.ReceiptHandle);
      }
    }
  }
}
