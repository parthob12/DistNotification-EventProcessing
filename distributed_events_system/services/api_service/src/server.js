import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { config } from "./config.js";
import { router as eventsRouter } from "./routes/events.js";
import { metricsHandler } from "./metrics.js";

const log = pino({ level: process.env.LOG_LEVEL || "info" });

export function buildApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger: log }));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/metrics", metricsHandler);

  app.use(eventsRouter);

  return app;
}

export function start() {
  const app = buildApp();
  app.listen(config.port, () => {
    log.info({ port: config.port }, "api_service_listening");
  });
}
