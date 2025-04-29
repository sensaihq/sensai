/**
 * Returns true if the given absoltute `path` is relative to absolute `root` path.
 */

export const isRelative = (root: string, path: string): boolean => {
  return path.substring(0, root.length) === root
}