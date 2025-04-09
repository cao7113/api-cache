// todo improve types

export const VENDOR_NAME = "tanshu";

export enum ApiEndpoints {
  // https://www.tanshuapi.com/market/detail-134
  // ISBN数据查询_基础版
  // 通过请求13位的ISBN编码可以查询图书相关信息，包括图书名称、作者、出版社、出版时间、价格以及书籍封面等信息。
  // 600次/月普通会员
  // 30000次/月白银会员
  // 1000000次/月钻石会员
  // 不限调用量钻石会员PLUS
  IsbnBase = "/api/isbn_base/v1/index",

  // https://www.tanshuapi.com/market/detail-78
  // 通过传入13位的ISBN编码查询图书相关信息，包括图书名称、出版社、作者、页码以及书籍封面等信息。【接口合作专业书商，针对小众书籍有较高查得率。如需基础版区别描述，请联系专业客服。】
  // ¥0.01 （约0.0001元/次）新用户一分购
  IsbnPro = "/api/isbn/v2/index",
}

export interface BookData {
  title: string;
  author: string;
  publisher: string;
  pubdate: string;
  summary: string;
  isbn: string;
  img: string;
  pubplace: string;
  pages: string;
  price: string;
  binding: string;
  edition: string;
  format: string;
}

export interface TsApiResponse {
  code: number;
  msg: string;
  data: any;
}

export interface TsBookResp extends TsApiResponse {
  data: BookData;
}

export type RespData = {
  ok: boolean;
  error: string | null;
  data: BookData | null;
};

export interface BookInfoProvider {
  getIsbnInfo(isbn: string, reqPath: ApiEndpoints, options: any): Promise<any>;
}
