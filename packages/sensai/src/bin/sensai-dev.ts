import * as commander from "commander";
import { DEV_SERVER_DEFAULT_PORT, SENSAI_COMMAND } from "@/src/constants";
import getPort from "@/src/utils/port";
import command from "@/src/commands/dev";
import cli from "@/src/lib/cli";
import { SENSAI_MODE } from "@/src/constants";

/**
 * Create server instance according to options passed to the CLI.
 */

const initializeDevServer = async (options: {
  port: string;
  watch: boolean;
  agent: boolean;
}) => {
  const mode = options.agent ? SENSAI_MODE.AGENT : SENSAI_MODE.API;
  const port = await getPort(Number(options.port));
  await cli(mode, port);
  await command({
    port,
    apiDir: "api",
    watch: options.watch,
    cwdPath: process.cwd(),
  });
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
  .option("--agent", "enable agent mode")
  .usage("-p <port number>")
  .action(initializeDevServer);
