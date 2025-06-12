import { streamText, ToolSet, jsonSchema } from "ai-core";
import { Readable } from "node:stream";
import { openai } from "@ai-sdk/openai";
import { getHandlerOptions } from "@/src/lib/guard";

export default async (
  prompt: string,
  options: {
    tools?: ToolSet;
  } = {}
) => {
  const { tools = {} } = options;
  const result = streamText({
    model: openai("gpt-4o"),
    maxSteps: Object.keys(tools).length + 4, // default value
    messages: [
      { role: "user", content: prompt },
      // ...TODO normalize messages
    ],
    tools,
  });
  return Readable.fromWeb(result.textStream);
};

/**
 * This method is used to transform a "guarded" function into a LLM
 * tool.
 * @private
 */

export const tool = <T extends Parameters<typeof getHandlerOptions>[0]>(
  execute: T
) => {
  const options = getHandlerOptions(execute);
  if (options) {
    // TODO add sensible defaults
    const { description, input = {} } = options;
    return {
      description,
      parameters: jsonSchema(input),
      execute: async (args) => {
        const result = await execute(args);
        if (result == undefined) return `[SUCCESS] ${description}`;
        // if Readable strem, convert to string
        if (result instanceof Readable) {
          const chunks: string[] = [];
          for await (const chunk of result) {
            chunks.push(chunk.toString());
          }
          return chunks.join("");
        }
        return result;
      },
    };
  }
};
