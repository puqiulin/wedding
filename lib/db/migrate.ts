import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const client = new PGlite(process.env.PGLITE_DATA_DIR ?? "./data/pglite");
const db = drizzle({ client });

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations complete");
