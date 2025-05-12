import context from "@/src/lib/server/context";
import { Context } from "@/src/types";
import ServerError from "@/src/lib/server/error";

export default (code: number = 200, errorMessage?: string): ServerError => {
  const { status } = context.getStore() as Context;
  status.code = code;
  status.errorMessage = errorMessage;
  return new ServerError(code, errorMessage);
};
