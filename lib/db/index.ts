import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

declare global {
  // Next compiles route bundles separately in dev/prod. Keep one PGlite instance
  // per Node process so API writes and page reads see the same embedded database.
  var weddingDbPromise: ReturnType<typeof createDb> | undefined;
  var weddingDbSchemaPromise: Promise<void> | undefined;
  var weddingDbSchemaVersion: number | undefined;
}

const schemaVersion = 4;

const schemaSql = `
CREATE TABLE IF NOT EXISTS "photos" (
  "id" serial PRIMARY KEY NOT NULL,
  "src" text NOT NULL,
  "alt" text DEFAULT '' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "file_name" text DEFAULT '' NOT NULL;
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "file_size" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "music" (
  "id" serial PRIMARY KEY NOT NULL,
  "src" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cover_images" (
  "id" serial PRIMARY KEY NOT NULL,
  "src" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "visitor_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "ip" text DEFAULT '' NOT NULL,
  "path" text DEFAULT '' NOT NULL,
  "referer" text DEFAULT '' NOT NULL,
  "country_code" text DEFAULT '' NOT NULL,
  "country_name" text DEFAULT '' NOT NULL,
  "continent_code" text DEFAULT '' NOT NULL,
  "continent_name" text DEFAULT '' NOT NULL,
  "registered_country_code" text DEFAULT '' NOT NULL,
  "registered_country_name" text DEFAULT '' NOT NULL,
  "city_name" text DEFAULT '' NOT NULL,
  "region_name" text DEFAULT '' NOT NULL,
  "time_zone" text DEFAULT '' NOT NULL,
  "latitude" double precision,
  "longitude" double precision,
  "autonomous_system_number" integer,
  "autonomous_system_organization" text DEFAULT '' NOT NULL,
  "rir" text DEFAULT '' NOT NULL,
  "is_anonymous" boolean DEFAULT false NOT NULL,
  "is_anonymous_vpn" boolean DEFAULT false NOT NULL,
  "is_hosting_provider" boolean DEFAULT false NOT NULL,
  "is_public_proxy" boolean DEFAULT false NOT NULL,
  "is_tor_exit_node" boolean DEFAULT false NOT NULL,
  "browser_name" text DEFAULT '' NOT NULL,
  "browser_version" text DEFAULT '' NOT NULL,
  "os_name" text DEFAULT '' NOT NULL,
  "os_version" text DEFAULT '' NOT NULL,
  "device_type" text DEFAULT '' NOT NULL,
  "device_vendor" text DEFAULT '' NOT NULL,
  "device_model" text DEFAULT '' NOT NULL,
  "engine_name" text DEFAULT '' NOT NULL,
  "engine_version" text DEFAULT '' NOT NULL,
  "cpu_architecture" text DEFAULT '' NOT NULL,
  "user_agent" text DEFAULT '' NOT NULL,
  "accept_language" text DEFAULT '' NOT NULL,
  "geo_raw" jsonb,
  "user_agent_raw" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
`;

async function createDb() {
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./data/pglite";
  const client = new PGlite(dataDir);
  await client.exec(schemaSql);
  return drizzle({ client, schema });
}

export async function getDb() {
  globalThis.weddingDbPromise ??= createDb();
  const db = await globalThis.weddingDbPromise;

  if (globalThis.weddingDbSchemaVersion !== schemaVersion) {
    globalThis.weddingDbSchemaPromise ??= db.$client.exec(schemaSql)
      .then(() => {
        globalThis.weddingDbSchemaVersion = schemaVersion;
      })
      .finally(() => {
        globalThis.weddingDbSchemaPromise = undefined;
      });
    await globalThis.weddingDbSchemaPromise;
  }

  return db;
}
