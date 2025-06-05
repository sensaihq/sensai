import httpServer from "@/src/lib/server/http";
import createRouter from "@/src/lib/router";
import gateway from "@/src/lib/server/gateway";
import walker from "@/src/utils/walker";
import createWatcher from "@/src/lib/router/watcher";
import createCompiler from "@/src/lib/compiler";
import { type SensaiConfig } from "@/src/types"; // TODO we should have a standard on how to declare and name types
import { JSExtensionE } from "@/src/lib/compiler/enums";
import typescript from "@/src/commands/typescript";

const apiRouteRegex = /^\/api($|\/|\?)/;

export default async (options: SensaiConfig) => {
  const { watch, port } = options;

  // initialize development router
  const router = await createDevRouter(options);
  if (watch) await createWatcher(router, options); // TODO should be part of createDevRouter
  createCompiler(router, options); // TODO should be part of createDevRouter

  // connect router to HTTP
  const api = gateway(router);
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

const createDevRouter = async ({
  cwdPath,
  apiDir,
}: {
  cwdPath: string;
  apiDir: string;
}) => {
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

  // read api directory and add all files to the router
  const entries = await walker(apiDir);
  for await (const filePath of entries) {
    devRouter.add(filePath);
  }
  return devRouter;
};
