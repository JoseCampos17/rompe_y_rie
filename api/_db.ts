import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./_schema";

let sqlClient: postgres.Sql | null = null;
let dbInstance: PostgresJsDatabase<typeof schema> | null = null;
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
    console.log("Postgres orders table verified/created successfully.");
  } catch (err) {
    console.error("Error creating orders table in Postgres:", err);
  }
}

function getDb() {
  // Prioritize PRISMA_DATABASE_URL or POSTGRES_URL to ensure we get the Postgres link, not the MySQL one
  let url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) return null;

  // Discard mysql connection string if it was loaded from DATABASE_URL
  if (url.startsWith("mysql://") || url.startsWith("mysqls://")) {
    url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || "";
    if (!url) return null;
  }

  if (!dbInstance) {
    sqlClient = postgres(url, { ssl: { rejectUnauthorized: false } });
    dbInstance = drizzle(sqlClient, { schema });
    checkAndCreateTable(sqlClient);
  }
  return dbInstance;
}

export default getDb;
