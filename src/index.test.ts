import { describe, it, expect, vi } from "vitest";
import { OpenAPIHono } from "@hono/zod-openapi";
import finalApp from "./index";
import { version } from "../package.json";

vi.mock("./tanshu", () => {
  const app = new OpenAPIHono();
  return { default: app };
});
vi.mock("./caching/web", () => {
  const app = new OpenAPIHono();
  return { default: app };
});

describe("Ping endpoint", () => {
  it("should return Pong and version", async () => {
    const request = new Request("http://localhost/ping", { method: "GET" });
    const response = await finalApp.fetch(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Pong");
    expect(data.version).toBe(version);
  });
});
