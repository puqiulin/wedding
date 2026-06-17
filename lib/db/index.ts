import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = postgres(databaseUrl, { max: 1 });
  return drizzle(client, { schema });
}

let db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  db ??= createDb();
  return db;
}
