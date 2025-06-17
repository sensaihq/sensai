import * as commander from "commander";
import { SENSAI_COMMAND } from "../constants";

// create build command
export default new commander.Command()
  .command(SENSAI_COMMAND.BUILD)
  .description(
    "Description:\n  Compiles and optimize sensai project for production deployment."
  )
  .option("--agent", "build in agent mode")
  .action(async (options: { agent: boolean }) => {
    const { default: command } = await import("@/src/commands/build");
    await command({
      apiDir: "api",
    });
  });
