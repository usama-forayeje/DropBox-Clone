import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

async function runMigrations() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Migrations completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigrations();
