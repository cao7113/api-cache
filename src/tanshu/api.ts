import {
  BookData,
  ApiEndpoint,
  RespData,
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

  // get raw isbn info
  async getIsbnInfo(
    isbn: string,
    reqPath: ApiEndpoint = ApiEndpoint.IsbnBase,
    opts: OptionalFetchOpts = { verbose: this.verbose }
  ): Promise<Response> {
    const baseUrl = `${apiUrl}${reqPath}?isbn=${isbn}`;
    const url = `${baseUrl}&key=${this.#authKey}`;

    const ckeys = { vendor: VENDOR_NAME, path: reqPath, pathKey: isbn };
    return await cfetch(url, ckeys, opts);
  }

  async getBookInfo(
    isbn: string,
    reqPath: ApiEndpoint = ApiEndpoint.IsbnBase,
    opts: OptionalFetchOpts = { verbose: this.verbose }
  ): Promise<BookData> {
    const resp = await this.getIsbnInfo(isbn, reqPath, opts);

    if (!resp.ok) {
      if (this.verbose) {
        console.error(JSON.stringify(resp, null, 2));
      }
      throw new Error(`Failed to fetch ISBN ${isbn}`);
    }

    const info: TsBookResp = await resp.json();
    if (info.code !== 1) {
      if (this.verbose) {
        console.error(JSON.stringify(resp, null, 2));
      }
      throw new Error(`Failed to fetch ISBN ${info.msg}`);
    }
    return info.data;
  }
}
