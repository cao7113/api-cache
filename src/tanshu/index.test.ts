import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Api from "./api";
import { ApiEndpoint } from "./types";
import { cfetch } from "../caching";

vi.mock("../caching", () => {
  return {
    cfetch: vi.fn(),
  };
});

describe("Api", () => {
  const dummyApiKey = "dummy-key";
  const isbn = "9787115424914";
  const path = ApiEndpoint.IsbnBase;
  const opts = {
    forceRemote: false,
    useCache: true,
    fallbackWhenMissCache: true,
    verbose: false,
  };
  const mockResponseData = { data: "test response" };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {});

  it("should return valid isbn response when fetch is successful", async () => {
    const apiClient = new Api(dummyApiKey);
    vi.mocked(cfetch).mockResolvedValue(Response.json(mockResponseData));

    const resp = await apiClient.getIsbnResponse(isbn, path, opts);
    const data = await resp.json();
    expect(data).toEqual(mockResponseData);
    // expect(cfetch).toHaveBeenCalled();
    expect(cfetch).toHaveBeenCalledWith(
      // expect.any(Object),
      "http://test.tanshu.api.host/api/isbn_base/v1/index?isbn=9787115424914&key=dummy-key",
      {
        path: "/api/isbn_base/v1/index",
        pathKey: "9787115424914",
        vendor: "tanshu",
      },
      opts
    );
  });

  it("should throw error when fetch response is not ok", async () => {
    const apiClient = new Api(dummyApiKey);

    vi.mocked(cfetch).mockRejectedValue(
      new Error(`Failed to fetch remote url: test only`)
    );

    await expect(apiClient.getIsbnResponse(isbn, path, opts)).rejects.toThrow(
      /Failed to fetch remote url/
    );
    expect(cfetch).toHaveBeenCalled();
  });
});
