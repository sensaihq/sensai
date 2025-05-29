import NativeModule from "node:module";
import { basename, parse, join, sep } from "node:path";
import { readFileSync } from "node:fs";
import { Options, transformSync } from "@swc/core";
import options, { getCompilerOptions } from "@/src/lib/compiler/options";
import {
  getMarkdownTypescript,
  getPromptTypescript,
} from "@/src/lib/compiler/markdown";
import type { CompilerOptionsT } from "@/src/lib/compiler/types";
import { JSExtensionE, MDExtensionE } from "@/src/lib/compiler/enums";
import { FILE_TYPE } from "@/src/constants";

/**
 * Add extension hooks to transpile file everytime it is imported.
 */

export default (
  cwdPath: string,
  apiDir: string // TODO should support multiple paths
): void => {
  const aliases = getCompilerOptions(cwdPath);
  const apiPath = join(cwdPath, apiDir);
  for (const extension of Object.values(JSExtensionE)) {
    // @ts-ignore
    NativeModule._extensions[extension] = typescriptCompiler(aliases, apiPath);
  }
  // @ts-ignore
  NativeModule._extensions[MDExtensionE.MARKDOWN] = markdownCompiler(
    apiDir,
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
    return getJsCode(content, options(filename, aliases));
  });
};

/**
 * Creates a module extension to compile supported markdown files into JavaScript code.
 */

const markdownCompiler = (apiPath: string, aliases: CompilerOptionsT) => {
  return decorator((filename, content) => {
    if (filename.substring(0, apiPath.length) === apiPath) {
      const [prefix] = basename(filename, MDExtensionE.MARKDOWN).split(".");
      switch (prefix) {
        case FILE_TYPE.PROMPT: {
          const { dir, name } = parse(filename);
          return getJsCode(
            getPromptTypescript(content),
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
  const { code } = transformSync(content, options);
  if (
    // avoid circular dependencies when linking sensai locally
    options.filename === require.resolve("sensai/dist/src/lib/guard") ||
    // only transpile files withing process.cwd
    options.filename.includes(`${sep}node_modules${sep}`)
  ) {
    return content;
  }
  return `const { default: guard } = require('sensai/dist/src/lib/guard');(function(exports, guard) {${code}})(exports, guard);`;
  // TODO we will need ot generate source maps with new code while preserving the origin structure
};
