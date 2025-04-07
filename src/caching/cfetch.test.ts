import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { cacheClient } from "./index";
import { cfetch } from "./cfetch";

// Mock the cacheClient and fetch
vi.mock("./index", () => ({
  cacheClient: {
    getFromCache: vi.fn(),
    saveToCache: vi.fn(),
  },
}));

describe("cfetch", () => {
  const mockUrl = "https://example.com/api";
  const mockCacheKeys = { vendor: "test", path: "/test/path", pathKey: "123" };
  const mockResponseData = { id: 1, name: "Test Data" };

  // Setup fetch mock
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      clone: () => ({
        json: () => Promise.resolve(mockResponseData),
      }),
    });

    // Spy on console.info
    // todo
    // vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("use remote if forceRemote=true and ignore cache", async () => {
    // Mock cache hit
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(
      // JSON.stringify(mockResponseData)
      mockResponseData
    );
    // Mock a successful fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      clone: () => ({
        json: () => Promise.resolve(mockResponseData),
      }),
    });

    const response = await cfetch(mockUrl, mockCacheKeys, {
      forceRemote: true,
      // verbose: true,
    });
    const data = await response.clone().json();
    expect(data).toEqual(mockResponseData);

    expect(cacheClient.getFromCache).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
  });

  it("should return cached data when available and fallbackWhenMissCache=true", async () => {
    // Mock cache hit
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(
      // JSON.stringify(mockResponseData)
      mockResponseData
    );

    const response = await cfetch(mockUrl, mockCacheKeys);
    const data = await response.json();
    // console.info(`resp: ${JSON.stringify(data, null, 2)}`);

    expect(cacheClient.getFromCache).toHaveBeenCalledWith(mockCacheKeys);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(data).toEqual(mockResponseData);
  });

  it("should return cached data when available and fallbackWhenMissCache=false", async () => {
    // Mock cache hit
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(
      // JSON.stringify(mockResponseData)
      mockResponseData
    );

    const response = await cfetch(mockUrl, mockCacheKeys, {
      fallbackWhenMissCache: false,
    });
    const data = await response.json();
    expect(data).toEqual(mockResponseData);

    expect(cacheClient.getFromCache).toHaveBeenCalledWith(mockCacheKeys);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should throw when cache available but useCache=false", async () => {
    // // Mock cache
    // vi.mocked(cacheClient.getFromCache).mockResolvedValue(
    //   JSON.stringify(mockResponseData)
    // );

    await expect(
      cfetch(mockUrl, mockCacheKeys, { useCache: false })
    ).rejects.toThrow(/No response made/);

    expect(cacheClient.getFromCache).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should fallback to remote when data not found in cache", async () => {
    // Mock cache miss
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(null);

    const opts = {
      // verbose: true,
    };
    const response = await cfetch(mockUrl, mockCacheKeys, opts);

    expect(cacheClient.getFromCache).toHaveBeenCalledWith(mockCacheKeys);
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(cacheClient.saveToCache).toHaveBeenCalledWith(
      mockCacheKeys,
      mockResponseData
    );
  });

  it("should throw error when cache misses and fallback is disabled", async () => {
    // Mock cache miss
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(null);

    // When fallbackWhenMissCache is false, expect a fetch to still happen
    await expect(
      cfetch(mockUrl, mockCacheKeys, { fallbackWhenMissCache: false })
    ).rejects.toThrow(/No response made/);

    // Verify the right functions were called
    expect(cacheClient.getFromCache).toHaveBeenCalledWith(mockCacheKeys);
    expect(global.fetch).not.toBeCalled();
  });

  it("should throw error when remote fetch fails", async () => {
    // Mock cache miss and remote failure
    vi.mocked(cacheClient.getFromCache).mockResolvedValue(null);
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    await expect(cfetch(mockUrl, mockCacheKeys)).rejects.toThrow(
      /Failed to fetch remote url/
    );

    expect(cacheClient.getFromCache).toHaveBeenCalledWith(mockCacheKeys);
    // expect(global.fetch).toHaveBeenCalledWith(mockUrl, expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(cacheClient.saveToCache).not.toHaveBeenCalled();
  });
});
