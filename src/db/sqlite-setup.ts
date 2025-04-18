import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as path from "path";

// https://bun.sh/guides/ecosystem/drizzle

const verbose: boolean = process.env.VERBOSE || false;

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
db = drizzle(dbRaw, { logger: verbose });

if (verbose) {
  // Ensure we have an absolute path for the DB file
  const absoluteDbFilePath = path.resolve(process.cwd(), dbFilePath);
  console.info(`Prepare db file ${dbFilePath} at ${absoluteDbFilePath}`);
}

try {
  if (verbose) {
    console.info(`Running migrations on ${dbFilePath}...`);
  }

  // Run migration at runtime as option-4 from https://orm.drizzle.team/docs/migrations
  migrate(db, { migrationsFolder: "./drizzle" });

  if (verbose) console.info("Migrations completed successfully");
} catch (error) {
  console.error("Error running migrations:", error);
  throw error;
}

// Export database components
export { db, dbRaw, dbFilePath };
