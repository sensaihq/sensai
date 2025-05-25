// utils
import matter from "gray-matter";
import * as markdown from "markdown-wasm";

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
  return `
    import template from 'sensai/template'
    import ai from 'sensai/ai'
    ${tools.map((tool) => `import ${tool.name} from '${tool.path}'`).join("\n")}
    const tools = {${tools.map((tool) => `${tool.name}: { parameters: {}, execute: ${tool.name}}`).join(",")}}
    const prompt = template(${JSON.stringify(content)})
    export default async (data) => {
      const text = await prompt(data)
      return await ai(text, { tools })
    }
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
