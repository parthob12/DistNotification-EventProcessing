import { z } from "zod";

export const EventIngestSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.any()),
  source: z.string().min(1).optional()
});

export function nowIso() {
  return new Date().toISOString();
}
