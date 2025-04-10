import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { cacheClient } from "./index";

type Variables = {};

export const app = new OpenAPIHono<{
  Variables: Variables;
}>()
  // info
  .openapi(
    createRoute({
      tags: ["Caching"],
      summary: "Caching info",
      method: "get",
      path: "/info",
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
                total_count: z.number(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      const info = await cacheClient.getCacheInfo();
      return c.json(info);
    }
  )
  // latest items
  .openapi(
    createRoute({
      tags: ["Caching"],
      summary: "latest items",
      method: "get",
      path: "/latest",
      request: {
        query: z.object({
          vendor: z
            .string()
            .optional()
            .openapi({
              param: {
                name: "vendor",
                in: "query",
              },
              example: "tanshu",
            }),
          path: z
            .string()
            .optional()
            .openapi({
              param: {
                name: "path",
                in: "query",
              },
              example: null,
            }),
          pathkey: z
            .string()
            .optional()
            .openapi({
              param: {
                name: "pathkey",
                in: "query",
              },
              example: null,
            }),
          limit: z.coerce
            .number()
            .positive()
            .max(50)
            .optional()
            .openapi({
              param: {
                name: "limit",
                in: "query",
              },
              example: 2,
            }),
        }),
      },
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
                total_count: z.number(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      const { vendor, path, pathkey, limit } = c.req.valid("query");
      const ckeys = { vendor, path, pathKey: pathkey };
      const info = await cacheClient.getLatestItems(ckeys, limit);
      return c.json(info);
    }
  );

export default app;
