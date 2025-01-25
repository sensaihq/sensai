import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

/**
 * Create and optimize http server for speed.
 */

export default async (
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  port: number
): Promise<Server | never> => {
  const server = http.createServer({
    keepAliveTimeout: 72000,
    requestTimeout: 0,
  });
  server.on("request", handler);
  server.listen(port);
  return new Promise((resolve, reject) => {
    server.on("listening", () => resolve(server));
    server.on("error", reject);
  });
};
