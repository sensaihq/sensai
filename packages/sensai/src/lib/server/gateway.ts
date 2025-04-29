import type { IncomingMessage, ServerResponse } from "node:http";
import {
  HTTP_ANY,
  HTTP_DEFAULT_METHOD,
  HTTP_GET,
  HTTP_HEAD,
  HTTP_STATUS,
  MIME_TYPE,
  VERSION_DEFAULT,
} from "@/src/constants";
import { type Router } from "@/src/lib/router";
import context from "@/src/lib/server/context";

export default (router: Router) => {
  /**
   * HTTP REST flow.
   */

  return async (request: IncomingMessage, response: ServerResponse) => {
    const { method = HTTP_DEFAULT_METHOD, headers, url } = request;
    console.log("hello world");
    const { middlewares = [], resource, params } = router.lookup(url) || {};
    if (resource) {
      const isHead = method === HTTP_HEAD;
      const endpoint =
        resource[isHead ? HTTP_GET : method] || resource[HTTP_ANY];
      if (endpoint) {
        const route = endpoint[VERSION_DEFAULT]; // TODO check from header X-Api-Version or Accept?
        if (route) {
          const { route: routePath, type } = route;
          const data = await getRequestData(request);
          try {
            const output = await context.run({}, async () => {
              return await [...middlewares, routePath].reduce(
                (prev, next) => {
                  const { default: handler } = require(next);
                  return prev.then(handler.bind({ request, response }));
                },
                Promise.resolve({
                  ...data,
                  ...params,
                })
              );
            });
            const payload = output == null ? "" : JSON.stringify(output);
            write(
              response,
              HTTP_STATUS.OK,
              {
                "Content-Type": MIME_TYPE.JSON, // default charset for json is utf-8
                "Content-Length": Buffer.byteLength(payload),
              },
              isHead ? null : payload
            );
          } catch (error) {
            // TODO do something with error
            console.error(error);
            write(response, HTTP_STATUS.INTERNAL_ERROR);
          }
        } else {
          // status code when using content negotiation with the Accept header.
          write(response, HTTP_STATUS.NOT_ACCEPTABLE);
        }
      } else {
        write(response, HTTP_STATUS.NOT_ALLOWED, {
          Allow: Object.keys(resource),
        });
      }
    } else {
      write(response, HTTP_STATUS.NOT_FOUND);
    }
  };
};

/**
 * Extract data from the incoming message.
 */

const getRequestData = async (request: IncomingMessage) => {
  return {};
};

/**
 * Write or pipe payload to server response.
 */

const write = (
  response: ServerResponse,
  code: number,
  headers: any = {},
  payload?: string
) => {
  // TODO detech if payload is stream and pipe
  // TODO The content type of the response should match what the client expects based on the context of the API and the Accept header.
  response.writeHead(code, headers);
  response.end(payload);
};
