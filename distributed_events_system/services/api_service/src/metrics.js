import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const eventsReceived = new client.Counter({
  name: "events_received_total",
  help: "Total number of events accepted by the API"
});

register.registerMetric(eventsReceived);

export function metricsHandler(req, res) {
  res.set("content-type", register.contentType);
  res.end(register.metrics());
}
