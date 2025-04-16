// utils
import matter from 'gray-matter'
import * as markdown from 'markdown-wasm'

/**
 * Get typescript code from a prompt markdown file content `fileContent`
 */

export const getPromptTypescript = (fileContent: string): string => {
  const { content, data } = matter(fileContent)
  console.log(data)
  // TODO we should provide a way for a prompt to inject the result of an 
  // orhter prompt declaratively
  return `
    import template from 'sensai/template'
    const prompt = template(${JSON.stringify(content)})
    export default async (data) => {
      return await prompt(data)
    }
  `
}

/**
 * Get Typescript code from a markdown file content `fileContent`.
 */

export const getMarkdownTypescript = (fileContent: string | Buffer): string => {
  const { content, data } = matter(fileContent)
  // TODO it would be great to have a fast parser like markdown-wasm working with streams
  const html = markdown.parse(content)
  return `
    import template from 'sensai/template'
    const markdown = template(${JSON.stringify(html)})
    export default async (data) => {
      return markdown(data)
    }
  `
}