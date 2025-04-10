import { eq, and, desc } from "drizzle-orm";
import {
  CacheClient,
  CachedResponse,
  CacheKeys,
  OptionalCacheKeys,
} from "./types";
import { db, dbFilePath } from "../db/sqlite-setup";
import { remoteResponsesTable } from "../db/schema";

export class SqliteCacheClient implements CacheClient {
  async getFromCache(ckeys: CacheKeys): Promise<any | null> {
    if (!db) return null;

    const { vendor, path, pathKey } = ckeys;

    const result = await db
      .select({ responseData: remoteResponsesTable.responseData })
      .from(remoteResponsesTable)
      .where(
        and(
          eq(remoteResponsesTable.vendor, vendor),
          eq(remoteResponsesTable.path, path),
          eq(remoteResponsesTable.pathKey, pathKey)
        )
      )
      .get();

    return result ? result.responseData : null;
  }

  async saveToCache(ckeys: CacheKeys, value: any): Promise<void> {
    if (!db) return;

    const timestamp = Date.now();
    const { vendor, path, pathKey } = ckeys;
    try {
      await db
        .insert(remoteResponsesTable)
        .values({
          vendor: vendor,
          path: path,
          pathKey: pathKey,
          responseData: value,
          timestamp: timestamp,
        })
        .onConflictDoUpdate({
          target: [
            remoteResponsesTable.vendor,
            remoteResponsesTable.path,
            remoteResponsesTable.pathKey,
          ],
          set: {
            responseData: value,
            timestamp: timestamp,
          },
        });
    } catch (error) {
      console.error("Failed to save to cache:", error);
    }
  }

  async getTotalCount() {
    return await db?.$count(remoteResponsesTable);
  }

  async getRecentCacheEntries(
    keys?: OptionalCacheKeys,
    limit: number = 5
  ): Promise<CachedResponse[]> {
    if (!db) return [];

    let query = db
      .select({
        pathKey: remoteResponsesTable.pathKey,
        path: remoteResponsesTable.path,
        responseData: remoteResponsesTable.responseData,
        timestamp: remoteResponsesTable.timestamp,
      })
      .from(remoteResponsesTable);
    if (keys?.vendor) {
      query = query.where(eq(remoteResponsesTable.vendor, keys.vendor));
    }
    if (keys?.path) {
      query = query.where(eq(remoteResponsesTable.path, keys.path));
    }
    if (keys?.pathKey) {
      query = query.where(eq(remoteResponsesTable.pathKey, keys.pathKey));
    }
    const rows = await query
      .orderBy(desc(remoteResponsesTable.timestamp))
      .limit(limit)
      .all();

    return rows.map((row) => {
      const parsed = row.responseData;
      return {
        data: parsed.data,
        timestamp: new Date(row.timestamp).toISOString(),
      };
    });
  }

  async getCacheInfo(keys?: OptionalCacheKeys, limit: number = 3) {
    return {
      dbfile: dbFilePath,
      total_count: await this.getTotalCount(),
      latest_items: await this.getRecentCacheEntries(keys, limit),
    };
  }
}
