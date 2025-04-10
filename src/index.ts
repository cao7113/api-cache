// import { Hono } from "hono";
import { logger } from "hono/logger";
import { timing, setMetric, startTime, endTime } from "hono/timing";
import { env, getRuntimeKey } from "hono/adapter";
// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { version } from "../package.json";
import { bearerMiddleware } from "./auth";
import tanshu from "./tanshu";
import cachingWeb from "./caching/web";

const app = new OpenAPIHono<{
  // Specify the variable types to infer the `c.get('jwtPayload')`:
  Variables: {};
  Bindings: {};
}>();
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.use(logger(), timing());

app.use("/tanshu/*", bearerMiddleware);
app.route("/tanshu", tanshu);

app.use("/caching/*", bearerMiddleware);
app.route("/caching", cachingWeb);

app
  // ping-pong
  .openapi(
    createRoute({
      tags: ["Tools"],
      summary: "Ping Pong",
      method: "get",
      path: "/ping",
      request: {},
      responses: {
        200: {
          description: "Success message",
          content: {
            "application/json": {
              schema: z.object({
                message: z.literal("Pong"),
                version: z.string(),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({
        message: "Pong",
        version: version,
      });
    }
  );

// https://swagger.io/specification/
app.doc31("/openapi", (c) => {
  let origin = new URL(c.req.url).origin;
  if (origin.includes(".fly.dev") && origin.startsWith("http://")) {
    origin = origin.replace("http://", "https://");
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "API Cache API Docs",
      version: version,
      // https://spec.commonmark.org/0.31.2/#links
      description: `
        More: 
        - [Github](https://github.com/cao7113/api-cache)
        - [Hono Zod OpenAPI](https://hono.dev/examples/zod-openapi)
      `,
    },
    servers: [
      {
        url: origin,
        description: "Current",
      },
    ],
  };
});

const swUi = swaggerUI({
  url: "/openapi",
  title: "API Docs",
  // https://github.com/honojs/middleware/blob/main/packages/swagger-ui/README.md#options
  manuallySwaggerUIHtml: (asset) => `
    <div>
      <div id="swagger-ui"></div>
      ${asset.css.map((url) => `<link rel="stylesheet" href="${url}" />`)}
      ${asset.js.map(
        (url) => `<script src="${url}" crossorigin="anonymous"></script>`
      )}
      <script>
        window.ui = SwaggerUIBundle({
          url: "/openapi",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis],
          requestInterceptor: (request) => {
            if (window.location.href.startsWith("http://localhost") || window.location.href.startsWith("http://192.168.") || window.location.href.includes(".orb.local") ) {
              request.headers["Authorization"] = "Bearer ${
                process.env.BEARER_AUTH_TOKEN
              }";
            }
            return request;
          },
        });
      </script>
    </div>
  `,
});
app.get("/", swUi);

// console.log(JSON.stringify(app, null, 2));
const runtime = getRuntimeKey();
console.log(`App Version: ${version} on Runtime: ${runtime}`);

let finalApp: { fetch: any; idleTimeout?: number; port?: number };

switch (runtime) {
  case "bun":
    const port = process.env.FLY_APP_NAME
      ? Number(process.env.PORT ?? 8080)
      : Number(process.env.PORT ?? 3000);
    // https://hono.dev/docs/getting-started/bun#change-port-number
    finalApp = {
      fetch: app.fetch,
      idleTimeout: 30, // idle timeout in seconds
      port: port,
    };
    break;
  case "workerd": // production
    // https://chatgpt.com/c/67d0dd7c-d22c-8003-bc8b-db6b9037cbe3
    finalApp = app;
    break;
  case "node": // test in node by vitest
    // https://hono.dev/docs/getting-started/nodejs
    // finalApp = serve({
    //   fetch: app.fetch,
    //   port: 3000,
    // });
    finalApp = app;
    break;
  default:
    throw new Error(`Unsupported runtime: ${runtime}`);
}

export default finalApp;
