import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { cacheClient, type CacheKeys } from "./index";

type Variables = {};

// https://zod.dev/?id=coercion-for-primitives
// https://zod.dev/?id=preprocess
const BoolSchema = z.preprocess((val) => {
  const strVal = String(val).toLowerCase();
  if (strVal === "true") return true;
  if (strVal === "false") return false;
  if (typeof val === "boolean") return val;
  return false;
}, z.boolean({ invalid_type_error: "Must be boolean, true/false (case insensitive)" }));

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
      const info = await cacheClient.getCacheInfo(ckeys, limit);
      return c.json(info);
    }
  );

export default app;
