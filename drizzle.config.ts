// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Drizzle config - a configuration file that is used by Drizzle Kit
// and contains all the information about your database connection, migration folder and schema files.

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_PATH!,
  },
});
