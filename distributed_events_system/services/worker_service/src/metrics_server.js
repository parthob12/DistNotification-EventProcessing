import express from "express";
import { metricsHandler } from "./metrics.js";

export function startMetricsServer() {
  const app = express();

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/metrics", metricsHandler);

  const port = Number(process.env.METRICS_PORT || 9100);

  app.listen(port, () => {
    console.log("worker_metrics_listening", port);
  });
}
