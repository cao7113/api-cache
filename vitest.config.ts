import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 如有需要，可在此处添加其它测试配置
    environment: "node",
  },
  define: {
    "process.env.TANSHU_API_HOST": JSON.stringify(
      "http://test.tanshu.api.host"
    ),
  },
});
