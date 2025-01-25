import next from "next";

/**
 * Run documentation artifacts in production mode.
 */

export default async (dir: string) => {
  const app = next({ dev: false, dir });
  const handle = app.getRequestHandler();
  await app.prepare();
  return handle;
};
