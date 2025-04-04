import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

// https://bun.sh/guides/ecosystem/drizzle

// Get database file path from environment variables
const dbFilePath = process.env.DB_FILE_PATH;
if (!dbFilePath) {
  throw new Error("DB_FILE_PATH environment variable is not set");
}

// Initialize database and ORM
let dbRaw: Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;

dbRaw = new Database(dbFilePath);
// db = drizzle({ client: dbRaw });
db = drizzle(dbRaw);

// Initialize schema
// todo fix this to avoid: task db-push ???
// dbRaw.exec(schema.remoteResponsesTable.toSQL().toString());

// Export database components
export { db, dbRaw, dbFilePath };
