import httpServer from "@/src/lib/server/http";
import createRouter from "@/src/lib/router";
import gateway from "@/src/lib/server/gateway";
import walker from "@/src/utils/walker";
import watcher from "@/src/lib/router/watcher";
import compiler from "@/src/lib/compiler";
import { type SensaiConfig } from "@/src/types"; // TODO we should have a standard on how to declare and name types
import { JSExtensionE } from "@/src/lib/compiler/enums";
import typescript from "@/src/commands/typescript";

const apiRouteRegex = /^\/api($|\/|\?)/;

export default async (options: SensaiConfig) => {
  const cwdPath = process.cwd();
  const { apiDir, watch, port } = options;
  const router = await createDevRouter(cwdPath, apiDir);
  if (watch) await watcher(apiDir, router);
  compiler(cwdPath, apiDir);
  const api = gateway(router);
  // create http server
  const server = await httpServer((request, response) => {
    const { url } = request;
    if (apiRouteRegex.test(url)) {
      // TODO test for performance
      return api(request, response);
    } else {
      // TODO documentation
    }
  }, port);
  console.log(`Sensai Server Started on Port: ${port}`);
  return server;
};

/**
 * Create router with all files in the `apiDir` directory and initialize
 * Typescript if needed (i.e if `apiDir` contains at least one `.ts` or `.tsx` files).
 */

const createDevRouter = async (cwdPath: string, apiDir: string) => {
  let hasTypescript = false;
  const router = await createRouter(cwdPath);
  const devRouter = {
    ...router,
    // detect typesript whenever a file is added to the `apiDir` directory
    add(filePath: string) {
      const isTypescript =
        filePath.endsWith(JSExtensionE.TYPESCRIPT) ||
        filePath.endsWith(JSExtensionE.TSX);
      if (!hasTypescript && isTypescript) {
        hasTypescript = true;
        typescript();
      }
      router.add(filePath);
    },
  };
  const entries = await walker(apiDir);
  for await (const filePath of entries) {
    devRouter.add(filePath);
  }
  return devRouter;
};
