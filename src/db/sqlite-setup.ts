import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

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

// Run migration at runtime as option-4 from https://orm.drizzle.team/docs/migrations
console.log(`Running migrations on ${dbFilePath}...`);
try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed successfully");
} catch (error) {
  console.error("Error running migrations:", error);
  throw error;
}

// Export database components
export { db, dbRaw, dbFilePath };
