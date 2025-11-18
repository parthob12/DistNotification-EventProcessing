import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const eventsProcessed = new client.Counter({
  name: "events_processed_total",
  help: "Total events processed successfully"
});

export const eventsFailed = new client.Counter({
  name: "events_failed_total",
  help: "Total events that failed processing"
});

export const eventsDuplicateSkipped = new client.Counter({
  name: "events_skipped_duplicate_total",
  help: "Total duplicate events skipped by idempotency"
});

register.registerMetric(eventsProcessed);
register.registerMetric(eventsFailed);
register.registerMetric(eventsDuplicateSkipped);

export function metricsHandler(req, res) {
  res.set("content-type", register.contentType);
  res.end(register.metrics());
}
