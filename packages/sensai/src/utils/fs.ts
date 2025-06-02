import { access, readdir, writeFile, constants } from "node:fs/promises";
import { join } from "node:path";

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

/**
 * Writes content to a file, removing common indentation from the content.
 */

export const write = async (path: string, content: string) => {
  const match = content.match(/^[ \t]*(?=\S)/m);
  if (match) {
    // Find the first non-empty line and get its indentation
    const indent = match[0].length;
    return await writeFile(
      path,
      content
        .split("\n")
        .map((line) => line.substring(indent)) // Remove the common indentation
        .join("\n")
        .trim()
    );
  } else {
    return await writeFile(path, content.trim());
  }
};

export const hasFile = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};
