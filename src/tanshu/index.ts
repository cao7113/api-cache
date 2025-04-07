import type { JwtVariables } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Api from "./api";
import { ApiEndpoint } from "./types";

// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables;

const addClients = createMiddleware(async (c, next) => {
  const envs = env(c);
  const apiClient: Api = new Api(envs.TANSHU_API_KEY);
  c.set("apiClient", apiClient);
  await next();
});

export const app = new OpenAPIHono<{
  Variables: Variables;
}>()
  // get book-info
  .openapi(
    createRoute({
      summary: "Get book info by isbn",
      tags: ["Tanshu"],
      method: "get",
      path: "/isbn/{isbn}",
      request: {
        params: z.object({
          isbn: z
            .string()
            .length(13)
            // .min(10)
            // .max(13)
            .openapi({
              param: {
                name: "isbn",
                in: "path",
              },
              example: "9787115424914",
            }),
        }),
        query: z.object({
          // enum support?
          path: z.string().openapi({
            param: {
              name: "path",
              in: "query",
            },
            example: ApiEndpoint.IsbnBase,
          }),
          // boolean suuport
          // cached: z.string().openapi({
          //   param: {
          //     name: "cached",
          //     in: "query",
          //   },
          //   example: "true",
          // }),
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
      const { path } = c.req.valid("query");
      const apiClient = c.get("apiClient");

      // todo add opts
      const resp = await apiClient.getIsbnResponse(isbn, path);
      return resp;
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
