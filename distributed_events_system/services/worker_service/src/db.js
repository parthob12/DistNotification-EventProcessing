import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.postgresUrl
});

export async function getEventById(eventId) {
  const { rows } = await pool.query(
    "select id, type, payload, source, created_at from events where id = $1",
    [eventId]
  );
  return rows[0] || null;
}

export async function getProcessingRow(eventId) {
  const { rows } = await pool.query(
    "select event_id, status, attempt_count from event_processing where event_id = $1",
    [eventId]
  );
  return rows[0] || null;
}

export async function upsertProcessing(eventId, status, attemptCount, lastError) {
  const query = `
    insert into event_processing (event_id, status, attempt_count, last_error, updated_at)
    values ($1, $2, $3, $4, now())
    on conflict (event_id)
    do update set
      status = excluded.status,
      attempt_count = excluded.attempt_count,
      last_error = excluded.last_error,
      updated_at = now()
  `;
  await pool.query(query, [eventId, status, attemptCount, lastError || null]);
}
