import context from "@/src/lib/server/context";
import { Context } from "@/src/types";

export default () => {
  const store = context.getStore() as Context;
  // TODO we should proxy headers and parse values for convenience
  return store.headers;
};
