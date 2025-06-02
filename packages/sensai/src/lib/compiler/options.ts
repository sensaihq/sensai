import { join, extname } from "node:path";
import type { CompilerOptionsT } from "@/src/lib/compiler/types";
import type { CommonJsConfig, JsMinifyOptions, Options } from "@swc/core";
import { ENV_NAMESPACE, SENSAI_ENV } from "@/src/constants";
import {
  JSExtensionE,
  FileSyntaxE,
  ModuleTypeE,
} from "@/src/lib/compiler/enums";

// variable used to generate source maps or drop consoles
const isProd = process.env[ENV_NAMESPACE] === SENSAI_ENV.PROD;

// allowed extensions
const extensions = Object.values(JSExtensionE);

/**
 * Returns options needed to transform a file based on its extension.
 * TODO should source maps and drop console be options based to the function?
 */

export default (
  filename: string,
  compilerOptions: CompilerOptionsT
): Options | undefined => {
  // TODO replace output type
  const extension = extname(filename) as JSExtensionE;
  if (extensions.includes(extension)) {
    return {
      filename,
      minify: true,
      //...getSourceMapsOptions(),
      isModule: true,
      module: getModuleOptions(),
      swcrc: false,
      jsc: {
        loose: true,
        target: "es2022",
        parser: {
          syntax: getSyntax(extension),
          tsx: false,
          dynamicImport: true,
          decorators: true,
        },
        minify: getMinifyOptions(),
        transform: {
          // decoratorVersion: "2022-03",
          legacyDecorator: true,
          decoratorMetadata: true,
          constModules: {
            // TODO allow to inject env variables from endpoints
            globals: {
              "@simpi/env": {
                SOME_VAR: "true",
              },
            },
          },
        },
        ...compilerOptions,
      },
    };
  }
};

/**
 * Get source maps options based on environment.
 * On production, source maps will be generated in separate files using the version 3
 * without `sourcesContent` (`inlineSourcesContent: false`).
 */

const getSourceMapsOptions = (): Pick<
  Options,
  "sourceMaps" | "inlineSourcesContent"
> => {
  return {
    sourceMaps: isProd ? false : "inline",
    inlineSourcesContent: false,
  };
};

/**
 * Returns minification options based on environment.
 */

const getMinifyOptions = (): JsMinifyOptions => {
  return {
    mangle: true,
    compress: {
      dead_code: true,
      drop_console: isProd ? true : false, // TODO we should have an override in config
    },
    module: true,
  };
};

/**
 * Get module options based on file extension and type.
 */

const getModuleOptions = (): CommonJsConfig => {
  return {
    type: ModuleTypeE.COMMON,
    // lazy: true,
    ignoreDynamic: false, // if set to true, dynamic imports are preserved
    noInterop: false,
  };
};

/**
 * Get file syntax (either typescript or ecmascript)
 */

const getSyntax = (extension: JSExtensionE): FileSyntaxE => {
  return extension === JSExtensionE.TYPESCRIPT
    ? FileSyntaxE.TYPESCRIPT
    : FileSyntaxE.JAVASCRIPT;
};

/**
 * Get `baseUrl` and `paths` from `tsconfig.json` file if it exists and fallback
 * on
 */

export const getCompilerOptions = (cwdPath: string): CompilerOptionsT => {
  try {
    const { compilerOptions } = require(join(cwdPath, "tsconfig.json"));
    if (compilerOptions) {
      const { baseUrl, paths } = compilerOptions;
      return { baseUrl, paths };
    }
    return { baseUrl: undefined, paths: undefined };
  } catch {
    return { baseUrl: undefined, paths: undefined };
  }
};
