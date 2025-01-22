import * as commander from "commander";
import { PROD_SERVER_DEFAULT_PORT, SENSAI_COMMAND } from "@/src/constants";

// create start command
export default new commander.Command()
  .command(SENSAI_COMMAND.START)
  .description(
    "Description:\n  Start production server.\nThe project should be compiled with `sensai build` first."
  )
  .option(
    "-p, --port <number>",
    "port number on which to start the API server",
    process.env.PORT || PROD_SERVER_DEFAULT_PORT
  )
  .usage("<dir> -p <port number>")
  .action(async (options: { port: string }) => {
    const { default: command } = await import("@/src/commands/start");
    await command({
      port: Number(options.port),
    });
  });
