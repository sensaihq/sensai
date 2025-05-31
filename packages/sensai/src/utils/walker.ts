import { readdir } from "node:fs/promises";
import { join, posix, sep } from "node:path";

/**
 * Recursively walk a directory and stream route files with applicable middlewares
 * All paths are normalized to POSIX format as it is what's used for URIs.
 *
 * @todo TODO stop propagration on slot folders
 */

const walk = async function* (dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  // Process all entries in a single pass
  for (const entry of entries) {
    const { name } = entry;
    const path = join(dir, name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else {
      yield posix.join("/", ...path.split(sep));
    }
  }
};

export default walk;
