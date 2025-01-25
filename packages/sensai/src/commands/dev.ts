import httpServer from "@/src/lib/server/http";
import initializeDoc from "@/src/lib/server/dev/doc";
import { DEV_DOC_PATH } from "@/src/constants";
import { type SensaiConfig } from "@/src/types";

export default async (options: SensaiConfig) => {
  const doc = await initializeDoc(DEV_DOC_PATH);
  const server = await httpServer((request, response) => {
    const { url } = request;
    if (url === "/api" || url.startsWith("/api/")) {
      console.log("API");
      return;
    } else {
      return doc(request, response);
    }
  }, options.port);
  console.log("師 ✦ ⁂ listen dev server");
  return server;
};
