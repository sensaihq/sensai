import * as commander from "commander";
import { DEV_SERVER_DEFAULT_PORT, SENSAI_COMMAND } from "@/src/constants";
import getPort from "@/src/utils/port"

/**
 * Create server instance according to options passed to the CLI.
 */

const initializeDevServer = async (apiDir: string, options: { port: string, watch: boolean }) => {
  const { default: command } = await import("@/src/commands/dev");
  const port = Number(options.port)
  await command({
    port: await getPort(port),
    apiDir,
    watch: options.watch
  })
}

// create dev command
export default new commander.Command()
  .command(SENSAI_COMMAND.DEV)
  .description("Description:\n  Start API server in development mode")
  .argument("[dir]", "represents the API directory", "api") // TODO replace with config
  .option(
    "-p, --port <number>",
    "port number on which to start the API server",
    process.env.PORT || DEV_SERVER_DEFAULT_PORT
  )
  .option('--no-watch', 'disable hot reload')
  .usage("<dir> -p <port number>")
  .action(initializeDevServer);


