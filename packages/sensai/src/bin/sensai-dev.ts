import * as commander from "commander";
import { DEV_SERVER_DEFAULT_PORT, SENSAI_COMMAND } from "@/src/constants";
import getPort from "@/src/utils/port";
import command from "@/src/commands/dev";
import { hasFile } from "@/src/utils/fs";
import { join } from "node:path";
import cli from "@/src/lib/cli";
import { SENSAI_MODE } from "@/src/constants";

/**
 * Create server instance according to options passed to the CLI.
 */

const initializeDevServer = async (options: {
  port: string;
  watch: boolean;
}) => {
  const mode = await detectMode();
  const port = await getPort(Number(options.port));
  await cli(mode, port);
  await command({
    port,
    apiDir: mode,
    watch: options.watch,
    cwdPath: process.cwd(),
  });
};

const detectMode = async (): Promise<SENSAI_MODE> => {
  const root = process.cwd();
  if (await hasFile(join(root, "agent"))) return SENSAI_MODE.AGENT;
  if (await hasFile(join(root, "api"))) return SENSAI_MODE.API;
  throw new Error(
    'No "agent" or "api" directory found in the current working directory.'
  );
};

// create dev command
export default new commander.Command()
  .command(SENSAI_COMMAND.DEV)
  .description("Description:\n  Start API server in development mode")
  .option(
    "-p, --port <number>",
    "port number on which to start the API server",
    process.env.PORT || DEV_SERVER_DEFAULT_PORT
  )
  .option("--no-watch", "disable hot reload")
  .usage("<dir> -p <port number>")
  .action(initializeDevServer);
