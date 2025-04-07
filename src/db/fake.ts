import { db } from "./sqlite-setup";
import { remoteResponsesTable } from "./schema";

const items = [
  {
    pathKey: "9787115424914",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: {
      code: 1,
      msg: "操作成功",
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
        summary:
          "本书以图配文的形式，详细讲解了6种重要的密码技术：对称密码、公钥密码、单向散列函数、消息认证码、数字签名和伪*数生成器。     第1部分讲述了密码技术的历史沿革、对称密码、分组密码模式（包括ECB、CBC、CFB、OFB、CTR）、公钥密码、混合密码系统。第2部分重点介绍了认证方面的内容，涉及单向散列函数、消息认证码、数字签名、证书等。第3部分讲述了密钥、*数、PGP、SSL\\/TLS 以及密码技术在现实生活中的应用。    第3版对旧版内容进行了大幅更新，并新增POODLE攻击、心脏出血漏洞、Superfish事件、SHA-3竞赛、Keccak、认证加密、椭圆曲线密码、比特币等内容。",
      },
    },
    timestamp: Date.now(),
  },
  {
    pathKey: "9787111653844",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: {
      code: 1,
      msg: "操作成功",
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
    },
    timestamp: Date.now(),
  },
  {
    pathKey: "9787115546081",
    vendor: "tanshu",
    path: "/api/isbn_base/v1/index",
    responseData: {
      code: 1,
      msg: "操作成功",
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
    },
    timestamp: Date.now(),
  },
];

await db?.insert(remoteResponsesTable).values(items).onConflictDoNothing();

console.log(`${items.length} items inserted`);
