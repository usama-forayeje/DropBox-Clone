import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "./.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    table: "__drizzle__migrations",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
