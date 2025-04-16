import httpServer from "@/src/lib/server/http"
import initializeDoc from "@/src/lib/server/dev/doc"
import { DEV_DOC_PATH } from "@/src/constants"
import { type SensaiConfig } from "@/src/types"
import router from "@/src/lib/router"
import gateway from "@/src/lib/server/gateway"
import walker from "@/src/utils/walker"
import watcher from "@/src/lib/router/watcher"
import compiler from "@/src/lib/compiler"


export default async (options: SensaiConfig) => {
  //const doc = await initializeDoc(DEV_DOC_PATH);
  const cwdPath = process.cwd()
  const routes = await router(cwdPath)
  const entries = await walker(options.apiDir)
  for await (const filePath of entries) {
    routes.add(filePath)
  }
  if (options.watch) await watcher(options.apiDir, routes)
  compiler(cwdPath, options.apiDir)
  const api = gateway(routes)
  // create http server
  const server = await httpServer((request, response) => {
    const { url } = request;
    if (url === "/api" || url.startsWith("/api/")) {
      return api(request, response);
    } else {
      // TODO this messes with our invalidate caching mechanism
      //return doc(request, response);
    }
  }, options.port)
  return server
}

