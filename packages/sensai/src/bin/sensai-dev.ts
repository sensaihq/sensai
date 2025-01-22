import * as commander from "commander";
import { DEV_SERVER_DEFAULT_PORT, SENSAI_COMMAND } from "@/src/constants";

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
  .usage("<dir> -p <port number>")
  .action(async (apiDir: string, options: { port: string }) => {
    const { default: command } = await import("@/src/commands/dev");
    await command({
      port: Number(options.port),
      apiDir,
    });
  });
