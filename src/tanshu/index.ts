import type { JwtVariables } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import TanshuApi from "./api";
import { cacheClient } from "../caching";

// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables;

const addClients = createMiddleware(async (c, next) => {
  const envs = env(c);
  // Create direct API client
  const clientApi = new TanshuApi(envs.TANSHU_API_KEY);
  c.set("clientApi", clientApi);
  c.set("cacheClient", cacheClient);

  await next();
});

export const app = new OpenAPIHono<{
  Variables: Variables;
}>()
  // get remote book-info
  .openapi(
    createRoute({
      summary: "Get basic book info by isbn",
      tags: ["Tanshu"],
      method: "get",
      path: "/isbn/{isbn}",
      request: {
        params: z.object({
          isbn: z
            .string()
            .min(10)
            .max(13)
            .openapi({
              param: {
                name: "isbn",
                in: "path",
              },
              example: "9787115424914",
            }),
        }),
        query: z.object({
          cached: z.string().openapi({
            param: {
              name: "cached",
              in: "query",
            },
            example: "true",
          }),
        }),
      },
      security: [
        {
          Bearer: [],
        },
      ],
      middleware: [addClients],
      responses: {
        200: {
          description: "Success message",
        },
      },
    }),
    async (c) => {
      const { isbn } = c.req.valid("param");
      const { cached } = c.req.valid("query");
      const clientApi = c.get("clientApi");

      // If cached=true, use the caching mechanism
      if (cached === "true") {
        const cacheClient = c.get("cacheClient");
        if (cacheClient) {
          const bookInfo = await cachedFetch(
            cacheClient,
            "tanshu",
            "/api/isbn_base/v1/index",
            () => clientApi.getIsbnInfo(isbn),
            isbn,
            { debug: true }
          );
          return c.json(bookInfo);
        }
      }

      // Default to direct API call
      const bookInfo = await clientApi.getIsbnInfo(isbn);
      return c.json(bookInfo);
    }
  )
  // get remote cache info
  .openapi(
    createRoute({
      summary: "Get cache info",
      tags: ["Tanshu"],
      method: "get",
      path: "/cache",
      request: {},
      security: [
        {
          Bearer: [],
        },
      ],
      middleware: [addClients],
      responses: {
        200: {
          description: "Success message",
        },
      },
    }),
    async (c) => {
      const cacheClient = c.get("cacheClient");
      if (!cacheClient) {
        return c.json({ error: "Cache client not available" });
      }

      try {
        const info = await cacheClient.getCacheInfo(
          "/api/isbn_base/v1/index",
          3
        );
        return c.json(info);
      } catch (error) {
        return c.json({
          error: "Failed to get cache info",
          details: String(error),
        });
      }
    }
  )
  // welcome
  .openapi(
    createRoute({
      tags: ["Tanshu"],
      summary: "Welcome to tanshu api",
      method: "get",
      path: "/hi",
      request: {},
      security: [
        {
          Bearer: [],
        },
      ],
      responses: {
        200: {
          description: "Success message",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      return c.json({ msg: "Welcome to tanshu API!" });
    }
  );

export default app;
