import { join, dirname } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

export default (basePath: string, template: Record<string, string>) => {
  mkdirp(basePath);
  for (const key in template) {
    const filePath = join(basePath, key);
    mkdirp(dirname(filePath));
    writeFileSync(join(basePath, key), template[key], { recursive: true });
  }
};

const mkdirp = (folderPath: string) => {
  return mkdirSync(folderPath, { recursive: true });
};
