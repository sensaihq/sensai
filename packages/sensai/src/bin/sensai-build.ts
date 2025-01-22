import * as commander from "commander";
import { SENSAI_COMMAND } from "../constants";

// create build command
export default new commander.Command()
  .command(SENSAI_COMMAND.BUILD)
  .description(
    "Description:\n  Compiles and optimize sensai project for production deployment."
  )
  .argument("[dir]", "represents the API directory", "api")
  .usage("<dir>")
  .action(async (apiDir: string) => {
    const { default: command } = await import("@/src/commands/build");
    await command({
      apiDir,
    });
  });
