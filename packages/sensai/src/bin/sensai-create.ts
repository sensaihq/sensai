import * as commander from "commander";
import { EXTERNAL_AGENT, SENSAI_COMMAND } from "@/src/constants";
import scaffolder from "@/src/commands/create";

// instantiate create command
export default new commander.Command()
  .command(SENSAI_COMMAND.CREATE)
  .description(
    "Description:\n  Agentic command to create a new project off a prompt."
  )
  .option("-p, --prompt <string>", "message to use as a prompt for the agent")
  .option(
    "-a, --agent <string>",
    "agent to use when scaffolding project with agent",
    EXTERNAL_AGENT.CLAUDE
  )
  .action(scaffolder);
