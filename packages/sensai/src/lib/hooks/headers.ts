import context from "@/src/lib/server/context";
import { Context } from "@/src/types";

export default () => {
  const store = context.getStore() as Context;
  // TODO we should proxy headers and parse values for convenience
  // TODO we should allow to set headers for the response!! (ex: using streams nd we know the length of the stream, like the size of a file)
  return store.headers;
};
