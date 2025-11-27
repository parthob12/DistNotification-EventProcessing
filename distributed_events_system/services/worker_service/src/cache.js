import { createClient } from "redis";
import { config } from "./config.js";

let client;

export async function getRedis() {
  if (client) return client;

  client = createClient({ url: config.redisUrl });
  client.on("error", (err) => {
    console.error("redis_error", err);
  });

  await client.connect();
  return client;
}

export function doneKey(eventId) {
  return `done:event:${eventId}`;
}

export async function isDoneCached(eventId) {
  if (!config.redisUrl) return false;

  const r = await getRedis();
  const val = await r.get(doneKey(eventId));
  return val === "1";
}

export async function markDoneCached(eventId) {
  if (!config.redisUrl) return;

  const r = await getRedis();
  await r.set(doneKey(eventId), "1", { EX: 900 });
}
