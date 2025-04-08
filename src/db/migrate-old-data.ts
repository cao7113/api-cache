import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { db } from "./sqlite-setup";
import { remoteResponsesTable } from "./schema";

const oldDbFile = "db/backup/tanshu-old-cache.sqlite";
const oldDb = drizzle(oldDbFile);
const oldCacheTable = sqliteTable("tanshu_isbn_books", {
  key: text("key", { mode: "text" }).notNull(),
  value: text("value", { mode: "json" }).notNull(),
  timestamp: integer("timestamp").notNull(),
});

async function moveData() {
  const rows = await oldDb.select().from(oldCacheTable);
  let idx = 0;
  for (const row of rows) {
    const { key, value, timestamp } = row;
    if (key.length < 10) {
      console.warn(
        `key ${key} is too short, skip, row: ${JSON.stringify(row, null, 2)}`
      );
      continue;
    }

    idx++;
    const newRespData = {
      code: 1,
      msg: "操作成功",
      data: value?.data,
    };
    const newRow = {
      pathKey: key,
      vendor: "tanshu",
      path: "/api/isbn_base/v1/index",
      responseData: newRespData,
      timestamp,
    };
    // console.log(newRow);

    await db?.insert(remoteResponsesTable).values(newRow).onConflictDoNothing();
    console.log(
      `[${idx}] inserted ISBN ${key} ${value.data?.title} ${timestamp}`
    );
  }
  const count = await db?.$count(remoteResponsesTable);
  console.log(`new-db total rows count: ${count}`);
}

moveData();
