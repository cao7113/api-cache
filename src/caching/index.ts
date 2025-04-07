export * from "./types";
export * from "./cfetch";

import { SqliteCacheClient } from "./sqlite";
export const cacheClient = new SqliteCacheClient();
