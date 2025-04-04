import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const remoteResponsesTable = sqliteTable(
  "remote_responses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pathKey: text("path_key", { mode: "text" }).notNull(),
    vendor: text("vendor", { mode: "text" }).notNull(),
    path: text("path", { mode: "text" }).notNull(),
    responseData: text("response_data", { mode: "json" }).notNull(),
    timestamp: integer("timestamp").notNull(),
  },
  (table) => ({
    vendorPathPathKeyIdx: uniqueIndex("vendor_path_pathkey_idx").on(
      table.vendor,
      table.path,
      table.pathKey
    ),
  })
);
