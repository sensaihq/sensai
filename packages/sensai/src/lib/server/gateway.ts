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
import parseBody from "@/src/lib/server/body";
import { parse as parseQueryParameters } from "@/src/utils/querystring";
import { parseUrl } from "@/src/utils/url";
import { SlugParams } from "@/src/types";
import { getUniqueRequestId } from "@/src/utils/request";
import { Stream } from "node:stream";

export default (router: Router) => {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const { method = HTTP_DEFAULT_METHOD, headers, url: requestUrl } = request;
    const { url, searchParams } = parseUrl(requestUrl);
    const { middlewares = [], resource, params } = router.lookup(url) || {};
    if (resource) {
      const isHead = method === HTTP_HEAD;
      const endpoint =
        resource[isHead ? HTTP_GET : method] || resource[HTTP_ANY];
      if (endpoint) {
        const route = endpoint[VERSION_DEFAULT]; // TODO check from header X-Api-Version or Accept?
        if (route) {
          const { route: routePath, type } = route;
          const data = await getRequestData(request, searchParams, params);
          try {
            const requestId = getUniqueRequestId();
            const output = await context.run(
              { headers, type, requestId },
              async () => {
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
              }
            );
            write(
              response,
              HTTP_STATUS.OK,
              { "X-Request-Id": requestId },
              output,
              isHead
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
 * Extract data from request.
 * @notes
 *   - the query parameters and URL path parameters are passed separately for speed.
 *   - we could merge query and body strings (ir url encoded) for faster parsing (it will also facilitate picking properties later on)
 */

const getRequestData = async (
  request: IncomingMessage,
  searchParams: string,
  params: SlugParams
) => {
  const body = await parseBody(request);
  return {
    ...parseQueryParameters(searchParams),
    ...body,
    ...params,
  };
};

/**
 * Write or pipe payload to server response.
 */

const write = (
  response: ServerResponse,
  code: number,
  headers: any = {},
  payload?: any,
  shouldNotReturnPayload?: boolean
) => {
  // TODO The content type of the response should match what the client expects based on the context of the API and the Accept header.
  if (payload instanceof Stream) {
    response.writeHead(code, {
      ...headers,
      "Transfer-Encoding": "chunked",
    });
    payload.pipe(response);
  } else {
    const output = payload == null ? "" : JSON.stringify(payload);
    response.writeHead(code, {
      ...headers,
      "Content-Type": MIME_TYPE.JSON, // default charset for json is utf-8
      "Content-Length": Buffer.byteLength(output),
    });
    response.end(shouldNotReturnPayload ? null : output);
  }
};
