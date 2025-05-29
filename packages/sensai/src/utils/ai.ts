import { streamText, ToolSet, jsonSchema, generateText } from "ai-core";
import { Readable } from "node:stream";
import { openai } from "@ai-sdk/openai";

export const schema = (properties: unknown) => {
  return jsonSchema(properties);
};

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

// export const tool = (mod: any) => {
//   // generate tool off module
//   return aiTool(mod);
// };
