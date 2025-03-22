import express from "express";
import { v4 as uuidv4 } from "uuid";
import { EventIngestSchema, nowIso } from "../../shared/schema.js";
import { insertEvent } from "../db.js";
import { enqueueEvent } from "../queue.js";
import { eventsReceived } from "../metrics.js";

export const router = express.Router();

router.post("/events", async (req, res) => {
  const parsed = EventIngestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid_request",
      details: parsed.error.issues
    });
  }

  const eventId = uuidv4();
  const createdAt = nowIso();

  const event = {
    id: eventId,
    type: parsed.data.type,
    payload: parsed.data.payload,
    source: parsed.data.source
  };

  try {
    await insertEvent(event);
    await enqueueEvent({ eventId, type: event.type, createdAt });

    eventsReceived.inc();

    return res.status(202).json({
      eventId,
      status: "accepted"
    });
  } catch (err) {
    req.log.error({ err, eventId }, "failed_to_ingest_event");
    return res.status(500).json({ error: "internal_error" });
  }
});
