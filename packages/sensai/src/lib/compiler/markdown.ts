// utils
import matter from "gray-matter";
import * as markdown from "markdown-wasm";

// const defaultSchema = {
//   type: "object",
//   oneOf: [
//     {
//       required: ["prompt"],
//       properties: {
//         prompt: {
//           type: "string",
//           description: "Direct prompt text to the LLM.",
//         },
//       },
//       additionalProperties: false,
//     },
//     {
//       required: ["messages"],
//       properties: {
//         messages: {
//           type: "array",
//           description:
//             "Array of message objects for conversational interaction.",
//           items: {
//             type: "object",
//             required: ["role", "content"],
//             properties: {
//               role: {
//                 type: "string",
//                 enum: ["system", "user", "assistant", "tool"],
//                 description: "The role defining the author of the message.",
//               },
//               content: {
//                 type: "string",
//                 description: "The message content.",
//               },
//             },
//             additionalProperties: false,
//           },
//           minItems: 1,
//         },
//       },
//       additionalProperties: false,
//     },
//   ],
// };

const defaultSchema = {
  type: "object",
  properties: {
    prompt: {
      type: "string",
      description: "The entire prompt provided by the user.",
    },
  },
  required: ["prompt"],
};

/**
 * Get typescript code from a prompt markdown file content `fileContent`
 */

export const getPromptTypescript = (
  fileContent: string,
  tools: { name: string; path: string }[] = [] // TODO type Tool should be global
): string => {
  const { content, data } = matter(fileContent);
  // TODO we should provide a way for a prompt to inject the result of an
  // orhter prompt declaratively

  // TODO we should find a better way for passthrough prompts
  return `
    import template from 'sensai/template';
    import ai, { tool } from 'sensai/dist/src/utils/ai'; // TODO this should be cleaner

    const tools = {};
    ${tools
      .map(
        (tool) => `
      tools["${tool.name}"] = tool(require('${tool.path}').default);
    `
      )
      .join("\n")}
    const content = ${JSON.stringify(content.trim())};
    const prompt = template(content);
    const input = content !== '#{prompt}' ? prompt.schema : ${JSON.stringify(defaultSchema)};
    export default guard(async (data) => {
      const text = await prompt(data);
      return await ai(text, { tools });
    }, { 
      description: ${JSON.stringify(data.description)},
      input,
    });
  `;
};

/**
 * Get Typescript code from a markdown file content `fileContent`.
 */

export const getMarkdownTypescript = (fileContent: string | Buffer): string => {
  const { content, data } = matter(fileContent);
  // TODO it would be great to have a fast parser like markdown-wasm working with streams
  const html = markdown.parse(content);
  return `
    import template from 'sensai/template'
    const markdown = template(${JSON.stringify(html)})
    export default async (data) => {
      return markdown(data)
    }
  `;
};
