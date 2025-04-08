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
// Note: should always return Response instance as original `fetch`
// require json response
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
    const respData = await cacheClient.getFromCache(ckeys);
    if (respData) {
      if (verbose) console.info(`Hit cache ${respData} and return`);
      return Response.json(respData);
    } else {
      if (verbose) console.info(`miss cache and fallback`);
      needRemote = fallbackWhenMissCache;
    }
  }

  if (needRemote) {
    if (verbose)
      console.info(
        `Requesting Remote API with ckeys ${JSON.stringify(ckeys, null, 2)}`
      );

    // RequestInit???
    const resp = await fetch(url);
    if (verbose)
      console.debug(
        `Fetched Remote API response with ckeys ${JSON.stringify(
          ckeys,
          null,
          2
        )}`
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
