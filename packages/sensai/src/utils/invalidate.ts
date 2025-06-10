import Module from "node:module";

// dependency tree
const dependencyTree: { [filename: string]: string[] | undefined } = {};

// cache default module require
const load = Module.prototype.require;

/**
 * Start tracking dependencies.
 */

export default () => {
  // @ts-ignore extend node module require
  Module.prototype.require = function (path: string): string {
    const content = load.call(this, path);
    // @ts-ignore
    addChildDependencies(Module._resolveFilename(path, this));
    return content;
  };

  /**
   * Invalidate module cache with given filename.
   *
   * @param {String} filename (absolute filename path)
   * @public
   */

  return (filename: string) => {
    const dependants = new Set();
    resetCache(filename, (file) => dependants.add(file));
    return {
      filename,
      dependants: dependants,
    };
  };
};

/**
 * Add child dependencies for a given module.
 * A dependency is a module that will need to be reseted whenever the parent
 * module (with the fiven `modFilename]`) changes.
 *
 * @param {String} modFilename
 * @private
 */

const addChildDependencies = (modFilename: string) => {
  const mod = require.cache[modFilename];
  if (mod) {
    for (const { filename } of mod.children) {
      const dep = (dependencyTree[filename] = dependencyTree[filename] || []);
      if (!dep.includes(modFilename)) dep.push(modFilename);
    }
  }
};

/**
 * Reset module cache.
 *
 * @param {String} filename
 * @param {Function} cb (function used to create a set of dependants modules)
 * @private
 */

const resetCache = (filename: string, cb: (file: string) => void): void => {
  const dependants = dependencyTree[filename];
  if (dependants) {
    for (const dep of dependants) {
      // TODO break down code to avoid range error max call stack
      resetCache(dep, cb);
      cb(dep);
    }
  }
  delete require.cache[filename];
  dependencyTree[filename] = undefined;
};
