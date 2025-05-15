import { sep, posix } from "path";
import httpServer from "@/src/lib/server/http";
import { type SensaiConfig } from "@/src/types";
import router from "@/src/lib/router";
import gateway from "@/src/lib/server/gateway";
import walker from "@/src/utils/walker";
import watcher from "@/src/lib/router/watcher";
import compiler from "@/src/lib/compiler";

const apiRouteRegex = /^\/api($|\/|\?)/;

export default async (options: SensaiConfig) => {
  //const doc = await initializeDoc(DEV_DOC_PATH);
  const cwdPath = process.cwd();
  const routes = await router(cwdPath);
  const entries = await walker(options.apiDir);
  for await (const filePath of entries) {
    const normalizedPath = '/' + posix.join(...filePath.split(sep));
    routes.add(normalizedPath);
  }
  if (options.watch) await watcher(options.apiDir, routes);
  compiler(cwdPath, options.apiDir);
  const api = gateway(routes);
  // create http server
  const server = await httpServer((request, response) => {
    const { url } = request;
    if (apiRouteRegex.test(url)) {
      // TODO test for performance
      return api(request, response);
    } else {
      // TODO documentation
    }
  }, options.port);
  console.log(`Sensai Server Started on Port: ${options.port}`);
  return server;
};
