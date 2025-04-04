import { db } from "./sqlite-setup";
import { remoteResponsesTable } from "./schema";

const items = [
  {
    pathKey: "9787115424914",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: JSON.stringify({
      ok: true,
      error: null,
      data: {
        title: "图解密码技术",
        img: "http://static1.showapi.com/app2/isbn/imgs/72868dd64dcd404e92f19d6f21ee9c71.jpg",
        author: "结城浩",
        isbn: "9787115424914",
        publisher: "人民邮电出版社",
        pubdate: "2016-06",
        pubplace: "",
        pages: "402",
        price: "89.00",
        binding: "平装",
        edition: "",
        format: "16开",
        summary: "本书以图配文的形式，比特币等内容。",
      },
    }),
    timestamp: Date.now(),
  },
  {
    pathKey: "9787111653844",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: JSON.stringify({
      ok: true,
      error: null,
      data: {
        title: "JavaScript高级程序设计",
        img: "http://static1.showapi.com/app2/isbn/imgs/59f8e7b32d1c4a88b4e91be19c306541.jpg",
        author: "Matt Frisbie",
        isbn: "9787111653844",
        publisher: "机械工业出版社",
        pubdate: "2020-04",
        pubplace: "",
        pages: "880",
        price: "128.00",
        binding: "平装",
        edition: "第4版",
        format: "16开",
        summary: "本书涵盖JavaScript的核心语言特性和高级编程技术。",
      },
    }),
    timestamp: Date.now(),
  },
  {
    pathKey: "9787115546081",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: JSON.stringify({
      ok: true,
      error: null,
      data: {
        title: "深入理解计算机系统",
        img: "http://static1.showapi.com/app2/isbn/imgs/45d7e8c619f74a2da5c649eb7f5e3c92.jpg",
        author: "Randal E. Bryant",
        isbn: "9787115546081",
        publisher: "人民邮电出版社",
        pubdate: "2021-01",
        pubplace: "",
        pages: "775",
        price: "139.00",
        binding: "平装",
        edition: "第3版",
        format: "16开",
        summary: "本书从程序员的视角详细阐述计算机系统的本质概念。",
      },
    }),
    timestamp: Date.now(),
  },
];

await db.insert(remoteResponsesTable).values(items);

console.log(`${items.length} items inserted`);
