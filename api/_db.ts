import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./_schema";

let isTableCreated = false;

async function checkAndCreateTable(client: any) {
  if (isTableCreated) return;
  try {
    await client`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(64) NOT NULL,
        client_email VARCHAR(320),
        event_date VARCHAR(128) NOT NULL,
        style VARCHAR(128) NOT NULL,
        size VARCHAR(64) NOT NULL,
        addons TEXT,
        details TEXT,
        budget VARCHAR(128),
        mp_operation_id VARCHAR(128),
        comprobante_url TEXT,
        comprobante_name VARCHAR(255),
        status VARCHAR(32) DEFAULT 'pending' NOT NULL,
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    isTableCreated = true;
  } catch (err) {
    console.error("Error creating orders table in Postgres:", err);
  }
}

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  const client = postgres(url, { ssl: "require" });
  checkAndCreateTable(client);
  return drizzle(client, { schema });
}

export default getDb;
