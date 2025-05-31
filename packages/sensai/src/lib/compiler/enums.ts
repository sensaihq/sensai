// compiler syntax
export enum FileSyntaxE {
  TYPESCRIPT = "typescript",
  JAVASCRIPT = "ecmascript",
}

// JavaScript file extensions
export enum JSExtensionE {
  COMMONJS = ".cjs",
  JAVASCRIPT = ".js",
  MODULE = ".mjs",
  TYPESCRIPT = ".ts",
  TSX = ".tsx",
}

export enum MDExtensionE {
  MARKDOWN = ".md",
  // TODO .mdx
}

export enum ModuleTypeE {
  // MODULE = 'module',
  COMMON = "commonjs",
}

// simpi modules to auto import
export enum AutoImportE {
  GUARD = "guard",
}

// worker methods used for compilation
export enum WorkerMethodsE {
  JAVASCRIPT = "javascript",
  ROUTE = "route",
  MARKDOWN = "markdown",
  PROMPT = "prompt",
  UNKNOWN = "unknown",
}
