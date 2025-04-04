export * from "./types";
// export * from "./client";
export * from "./cfetch";

import { SqliteCacheClient } from "./sqlite";
export const cacheClient = new SqliteCacheClient();
