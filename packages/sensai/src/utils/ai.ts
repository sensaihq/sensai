import { streamText, ToolSet } from "ai-core";
import { Readable } from "node:stream";
import { openai } from "@ai-sdk/openai";

export default async (
  prompt: string,
  options: {
    tools?: ToolSet;
  } = {}
) => {
  const { tools = {} } = options;
  const result = streamText({
    model: openai("gpt-4o"),
    prompt,
    tools,
  });
  return Readable.fromWeb(result.textStream);
};
