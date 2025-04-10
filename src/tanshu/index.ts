import type { JwtVariables } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ApiEndpoints } from "./types";
import { type OptionalFetchOpts } from "../caching";
import Api from "./api";

// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables;

const ApiEndpointsSchema = z.nativeEnum(ApiEndpoints);

// https://zod.dev/?id=coercion-for-primitives
// https://zod.dev/?id=preprocess
const BoolSchema = z.preprocess((val) => {
  const strVal = String(val).toLowerCase();
  if (strVal === "true") return true;
  if (strVal === "false") return false;
  if (typeof val === "boolean") return val;
  return false;
}, z.boolean({ invalid_type_error: "Must be boolean, true/false (case insensitive)" }));

const addClients = createMiddleware(async (c, next) => {
  const envs = env(c);
  const apiClient: Api = new Api(envs.TANSHU_API_KEY);
  c.set("apiClient", apiClient);
  await next();
});

export const app = new OpenAPIHono<{
  Variables: Variables;
}>()
  // get book-info by isbn
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
          path: ApiEndpointsSchema.openapi({
            param: {
              name: "path",
              in: "query",
            },
            example: ApiEndpointsSchema.enum.IsbnBase,
          }),
          forceremote: BoolSchema.openapi({
            param: {
              name: "forceremote",
              in: "query",
              description: "Accepts true/false (case insensitive)",
              required: false,
            },
            example: false,
          }),
          usecache: z
            .preprocess((val) => {
              const strVal = String(val).toLowerCase();
              if (strVal === "true") return true;
              if (strVal === "false") return false;
              if (typeof val === "boolean") return val;
              return true;
            }, z.boolean({ invalid_type_error: "Must be boolean, true/false (case insensitive)" }))
            .openapi({
              param: {
                name: "usecache",
                in: "query",
                description: "Accepts true/false (case insensitive)",
                required: false,
              },
              example: true,
            }),
          fallbackremote: z
            .preprocess((val) => {
              const strVal = String(val).toLowerCase();
              if (strVal === "true") return true;
              if (strVal === "false") return false;
              if (typeof val === "boolean") return val;
              return true;
            }, z.boolean({ invalid_type_error: "Must be boolean, true/false (case insensitive)" }))
            .openapi({
              param: {
                name: "fallbackremote",
                in: "query",
                description: "Accepts true/false (case insensitive)",
                required: false,
              },
              example: true,
            }),
          verbose: z
            .preprocess((val) => {
              const strVal = String(val).toLowerCase();
              if (strVal === "true") return true;
              if (strVal === "false") return false;
              if (typeof val === "boolean") return val;
              return true;
            }, z.boolean({ invalid_type_error: "Must be boolean, true/false (case insensitive)" }))
            .openapi({
              param: {
                name: "verbose",
                in: "query",
                description: "Accepts true/false (case insensitive)",
                required: false,
              },
              example: true,
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
      const { path, forceremote, usecache, fallbackremote, verbose } =
        c.req.valid("query");
      const apiClient = c.get("apiClient");

      const opts: OptionalFetchOpts = {
        forceRemote: forceremote,
        useCache: usecache,
        fallbackWhenMissCache: fallbackremote,
        verbose: verbose,
      };
      const resp = await apiClient.getIsbnResponse(isbn, path, opts);
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
