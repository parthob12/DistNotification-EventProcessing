import fetch from "node-fetch";
import { config } from "../../config.js";

export async function sendWebhook(event) {
  if (!config.webhookBaseUrl) {
    return { skipped: true, channel: "webhook" };
  }

  const url = `${config.webhookBaseUrl}/${encodeURIComponent(event.type)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        type: event.type,
        payload: event.payload,
        createdAt: event.created_at
      }),
      signal: controller.signal
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");

      if (resp.status >= 400 && resp.status < 500) {
        const err = new Error("webhook_permanent_failure");
        err.permanent = true;
        err.status = resp.status;
        err.body = text;
        throw err;
      }

      const err = new Error("webhook_transient_failure");
      err.permanent = false;
      err.status = resp.status;
      err.body = text;
      throw err;
    }

    return { delivered: true, channel: "webhook", status: resp.status };
  } finally {
    clearTimeout(timeoutId);
  }
}
