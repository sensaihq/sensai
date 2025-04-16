import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Recursively walk a directory and stream all filenames.
 * 
 * @returns Readable stream of filenames (with full paths)
 */

export const walk = async function* (dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
};