import { cacheClient } from "./index";
import { type CacheKeys } from "./types";

export type FetchOpts = {
  // highest priority if true
  forceRemote: boolean;
  // use cache if forceRemote is false
  useCache: boolean;
  fallbackWhenMissCache: boolean;
  verbose: boolean;
};

export type OptionalFetchOpts = Partial<FetchOpts>;

export const defaultOpts: FetchOpts = {
  forceRemote: false,
  useCache: true,
  fallbackWhenMissCache: true,
  verbose: false,
};

// cached fetch
// https://github.com/unjs/ofetch
export async function cfetch(
  url: string,
  ckeys: CacheKeys,
  opts?: OptionalFetchOpts
): Promise<Response> {
  // Merge provided options with defaults
  const finalOpts = {
    ...defaultOpts,
    ...opts,
  };
  const { forceRemote, useCache, fallbackWhenMissCache, verbose } = finalOpts;

  if (verbose)
    console.info(
      `call cfetch with opts: ${JSON.stringify(finalOpts, null, 2)}`
    );

  let needRemote = forceRemote;

  if (useCache && !forceRemote) {
    const resp = await cacheClient.getFromCache(ckeys);
    if (resp) {
      if (verbose) console.info(`hit cache ${resp} and return`);
      return new Response(resp);
    } else {
      if (verbose) console.info(`miss cache and fallback`);
      needRemote = fallbackWhenMissCache;
    }
  }

  if (needRemote) {
    if (verbose)
      console.info(
        `Requesting remote with ckeys ${JSON.stringify(ckeys, null, 2)}`
      );

    // RequestInit???
    const resp = await fetch(url);
    if (verbose)
      console.debug(
        `Fetched remote response with ckeys ${JSON.stringify(ckeys, null, 2)}`
      );

    if (resp?.ok) {
      // always refresh cache if ok
      const data = await resp.clone().json();
      await cacheClient.saveToCache(ckeys, data);
      if (verbose)
        console.info(
          `Refresh cache ${JSON.stringify(ckeys, null, 2)} with ${data}`
        );
      return resp;
    } else {
      throw new Error(
        `Failed to fetch remote url opts: ${JSON.stringify(ckeys, null, 2)}`
      );
    }
  } else {
    throw new Error("No response made, no cache load or remote request");
  }
}
