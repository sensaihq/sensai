import NativeModule from "node:module";
import { basename, parse, join, dirname, sep } from "node:path";
import { readFileSync } from "node:fs";
import {
  Options,
  transformSync,
  parseSync,
  Module,
  ModuleItem,
  Program,
} from "@swc/core";
import options, { getCompilerOptions } from "@/src/lib/compiler/options";
import {
  getMarkdownTypescript,
  getPromptTypescript,
} from "@/src/lib/compiler/markdown";
import type { CompilerOptionsT } from "@/src/lib/compiler/types";
import { JSExtensionE, MDExtensionE } from "@/src/lib/compiler/enums";
import { FILE_TYPE } from "@/src/constants";
import { Router } from "@/src/lib/router";

/**
 * Add extension hooks to transpile file everytime it is imported.
 */

export default (
  // compiler is routes-context aware
  routes: Router,
  options: {
    cwdPath: string;
    apiDir: string; // TODO should support multiple paths
  }
): void => {
  const { cwdPath, apiDir } = options;
  const aliases = getCompilerOptions(cwdPath);
  const apiPath = join(cwdPath, apiDir);
  for (const extension of Object.values(JSExtensionE)) {
    // @ts-ignore
    NativeModule._extensions[extension] = typescriptCompiler(aliases, apiPath);
  }
  // @ts-ignore
  NativeModule._extensions[MDExtensionE.MARKDOWN] = markdownCompiler(
    routes,
    apiPath,
    aliases
  );
};

/**
 * Creates a module extension to compile file into JavaScript code.
 * This method is mainly used to transpile TypeScript files but is also
 * used for JavaScript files to insure consistency.
 */

const typescriptCompiler = (aliases: any, apiPath: string) => {
  return decorator((filename, content) => {
    // TODO ONLY IF RELATIVE TO ROOT DIRECTORY
    return getJsCode(content, options(filename, aliases));
  });
};

/**
 * Creates a module extension to compile supported markdown files into JavaScript code.
 */

const markdownCompiler = (
  routes: Router,
  apiPath: string,
  aliases: CompilerOptionsT
) => {
  return decorator((filename, content) => {
    if (filename.substring(0, apiPath.length) === apiPath) {
      const [prefix] = basename(filename, MDExtensionE.MARKDOWN).split(".");
      switch (prefix) {
        case FILE_TYPE.PROMPT: {
          const { dir, name } = parse(filename);
          return getJsCode(
            getPromptTypescript(
              content,
              routes.getTools(dir).map((tool) => ({
                ...tool,
                path: join(dirname(apiPath), tool.path),
              }))
            ),
            options(join(dir, name + ".ts"), aliases)
          );
        }
        case FILE_TYPE.MOCK:
        case FILE_TYPE.ROUTE: {
          const { dir, name } = parse(filename);
          return getJsCode(
            getMarkdownTypescript(content),
            options(join(dir, name + ".ts"), aliases)
          );
        }
      }
    }
    // TODO or should we return content?
    throw new Error("temporary error");
  });
};

/**
 * This is a native module extension decorator.
 * @notes Native extensions need to be synchronous.
 */

const decorator = (cb: (filePath: string, content: string) => string) => {
  // TODO based on the extension and type, behavior might change
  return (mod: any, filename: string) => {
    // TODO prevent files in node_modules and outside of project
    const content = readFileSync(filename, "utf-8");
    try {
      mod._compile(cb(filename, content), filename);
    } catch (error: any) {
      // prevent exit 1
      throw new Error(error.message);
    }
  };
};

/**
 * Transform file content into JavaScript code.
 */

const getJsCode = (content: string, options: Options | undefined) => {
  // exclude third party node modules (TODO should exclude outside of project root)
  if (options.filename.includes(`${sep}node_modules${sep}`)) return content;
  const ast = parseSync(content, {
    ...options.jsc.parser,
    target: options.jsc.target,
  });
  // TODO check we are transpiling ONLY the right files
  const summary = getExpressionStatement(ast);
  const file = transformSync(ast, options).code;
  if (summary) return wrapSensaiModule(file, { summary });
  return file;
};

/**
 * This is used to define sensai meta properties on the given module.
 */

const wrapSensaiModule = (
  code: string,
  meta: Record<string, string>
): string => {
  return `
      const hiddenModule = require('sensai/dist/src/utils/hidden');
      (function (exports) {${code}})(exports);
      hiddenModule?.setHiddenProperty?.(exports, ${JSON.stringify(meta)});
      `;
};

/**
 * Sensai module can declare string litteral expression statements that can be used
 * for documentation or schema description.
 */

const getExpressionStatement = (ast: Module): string | void => {
  const first = ast?.body[0];
  if (
    first.type === "ExpressionStatement" &&
    first.expression.type === "StringLiteral"
  ) {
    return first.expression.value;
  }
};
