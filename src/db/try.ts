import { eq, inArray, and } from "drizzle-orm";
import { db } from "./sqlite-setup";
import { remoteResponsesTable } from "./schema";

// Try sqlite db
// https://orm.drizzle.team/docs/rqb

const demoVendor = "tanshu";
const demoPath = "/api/isbn_base/v1/index";
const demoPathKey = "9787115424914";

const demoData = {
  vendor: demoVendor,
  path: demoPath,
  pathKey: demoPathKey,
  responseData: {
    code: 1,
    msg: "操作成功",
    data: {
      title: "图解密码技术",
      img: "http://static1.showapi.com/app2/isbn/imgs/72868dd64dcd404e92f19d6f21ee9c71.jpg",
      author: "结城浩",
      isbn: demoPathKey,
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
};

await db
  ?.delete(remoteResponsesTable)
  .where(
    and(
      eq(remoteResponsesTable.vendor, demoVendor),
      eq(remoteResponsesTable.path, demoPath),
      eq(remoteResponsesTable.pathKey, demoPathKey)
    )
  );

const insertedRow = await db
  ?.insert(remoteResponsesTable)
  .values(demoData)
  .onConflictDoNothing()
  .returning()
  .get();
// const count = await oldDb.$count(oldCacheTable);

console.log(`Inserted row: ${JSON.stringify(insertedRow, null, 2)}`);

const queryRow = await db
  ?.select()
  .from(remoteResponsesTable)
  .where(
    and(
      eq(remoteResponsesTable.vendor, demoVendor),
      eq(remoteResponsesTable.path, demoPath),
      eq(remoteResponsesTable.pathKey, demoPathKey)
    )
  )
  .get();
console.log(`Query row: ${JSON.stringify(queryRow, null, 2)}`);
