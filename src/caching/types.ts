export type CacheKeys = {
  vendor: string;
  path: string;
  pathKey: string;
};

export type OptionalCacheKeys = Partial<CacheKeys>;

export interface CachedResponse {
  data: any;
  timestamp: string;
}

export interface CacheClient {
  getFromCache(ckeys: CacheKeys): Promise<any | null>;

  saveToCache(ckyes: CacheKeys, value: any): Promise<void>;

  getLatestItems(
    keys?: OptionalCacheKeys,
    limit?: number
  ): Promise<Array<CachedResponse>>;

  getCacheInfo(): Promise<any>;
  getTotalCount(): Promise<any>;
}
