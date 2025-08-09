import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.postgresUrl
});

export async function insertEvent({ id, type, payload, source }) {
  const query = `
    insert into events (id, type, payload, source)
    values ($1, $2, $3, $4)
  `;
  const values = [id, type, payload, source || null];
  await pool.query(query, values);
}
