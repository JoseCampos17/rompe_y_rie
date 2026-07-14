import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./_schema";

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  const client = postgres(url, { ssl: "require" });
  return drizzle(client, { schema });
}

export default getDb;
