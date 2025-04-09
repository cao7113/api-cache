import {
  BookData,
  ApiEndpoint,
  TsBookResp,
  BookInfoProvider,
  VENDOR_NAME,
} from "./types";

import { cfetch, type OptionalFetchOpts } from "../caching";

const apiUrl = process.env.TANSHU_API_HOST!;

export default class Api implements BookInfoProvider {
  #authKey?: string;
  verbose: boolean = true;

  public constructor(authKey?: string, verbose: boolean = false) {
    this.#authKey = authKey;
    this.verbose = verbose;
  }

  async getIsbnInfo(
    isbn: string,
    reqPath: ApiEndpoint = ApiEndpoint.IsbnBase,
    opts: OptionalFetchOpts = { verbose: this.verbose }
  ): Promise<TsBookResp> {
    const resp = await this.getIsbnResponse(isbn, reqPath, opts);
    const info = (await resp.json()) as TsBookResp;
    return info;
  }

  async getBookInfo(
    isbn: string,
    reqPath: ApiEndpoint = ApiEndpoint.IsbnBase,
    opts: OptionalFetchOpts = { verbose: this.verbose }
  ): Promise<BookData> {
    const info = await this.getIsbnInfo(isbn, reqPath, opts);

    if (info.code !== 1) {
      if (this.verbose) {
        console.error(JSON.stringify(info, null, 2));
      }
      throw new Error(`Failed to fetch ISBN ${info.msg}`);
    }
    return info.data;
  }

  async getIsbnResponse(
    isbn: string,
    reqPath: ApiEndpoint = ApiEndpoint.IsbnBase,
    opts: OptionalFetchOpts = { verbose: this.verbose }
  ): Promise<Response> {
    const baseUrl = `${apiUrl}${reqPath}?isbn=${isbn}`;
    const url = `${baseUrl}&key=${this.#authKey}`;

    const ckeys = { vendor: VENDOR_NAME, path: reqPath, pathKey: isbn };
    return await cfetch(url, ckeys, opts);
  }
}
