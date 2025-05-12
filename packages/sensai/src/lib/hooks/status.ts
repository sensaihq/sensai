import context from "@/src/lib/server/context";
import { Context } from "@/src/types";

export default (code: number = 200, errorMessage?: string): void => {
  const { status } = context.getStore() as Context;
  status.code = code;
  status.errorMessage = errorMessage;
};
