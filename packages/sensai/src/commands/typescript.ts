import { mkdir, readFile } from "fs/promises";
import { join } from "node:path";
import { exec } from "node:child_process";
import { write, hasFile } from "@/src/utils/fs";
import { ARTIFACTS_NAMESPACE } from "@/src/constants";
import { merge } from "@/src/utils/object";

export default async () => {
  await Promise.all([
    setupSensaiTypes(),
    setupTsConfig(),
    setupPackageJson(),
    setupGitIgnore(),
  ]);
};

/**
 * Add types needed by sensai to facilitate developement experience with Typescript.
 * Those types are added to the artifacts folder `.sensai` as they should never be modified
 * by the user.
 *
 * @note we will rewrite sensai types everytime the user runs the development server.
 */

const setupSensaiTypes = async (
  rootPath: string = process.cwd()
): Promise<void> => {
  const artifacts = join(rootPath, `.${ARTIFACTS_NAMESPACE}`, "types");
  await mkdir(artifacts, { recursive: true });
  await write(
    join(artifacts, "sensai.d.ts"),
    `
    declare global {
        const guard: typeof import('sensai/guard')['default']
    }
    export { guard }
    `
  );
};

/**
 * Create or update typescript configuration file (tsconfig.json)
 */

const setupTsConfig = async (rootPath: string = process.cwd()) => {
  const filePath = join(rootPath, "tsconfig.json");
  const hasTsConfig = await hasFile(filePath);
  const config = {
    exclude: ["node_modules", "dist"],
    include: [".sensai/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  };
  if (hasTsConfig) {
    try {
      const { default: json } = await import(filePath);
      // console.log("UPDATE TSCONFIG");
      await write(filePath, JSON.stringify(merge(json, config), null, 2));
    } catch (error) {
      console.error(error);
    }
  } else {
    // console.log("CREATE TSCONFIG");
    await write(filePath, JSON.stringify(config, null, 2));
  }
};

/**
 * Install dependencies such as typescript and node types if they are missing.
 */

const setupPackageJson = async () => {
  // filter dependencies to install
  const deps = (
    await Promise.all(
      ["typescript", "@types/node"].map(async (name) => {
        const bool = await hasDependency(name);
        if (!bool) return name;
      })
    )
  ).filter(Boolean);
  if (deps.length > 0) await installDevDependency(deps);
};

// TODO we might need a more robust solution has a dependency might exist in node_modules but not in the package.json
const hasDependency = async (name: string): Promise<boolean> => {
  const depPath = join(process.cwd(), "node_modules", name);
  return hasFile(depPath);
};

const installDevDependency = async (
  deps: string[],
  engine: ReturnType<typeof getPackageManager> = getPackageManager()
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    exec(
      `${engine} install --save-dev ${deps.join(" ")}`,
      (error, _stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }
        resolve(true);
      }
    );
  });
};

/**
 * Get package manager.
 */

const getPackageManager = (): "npm" | "yarn" | "pnpm" | "bun" => {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
};

const artifactsRegexp = new RegExp(
  `(^|\\n)\\.${ARTIFACTS_NAMESPACE}(\/)?($|\\n)`
);

/**
 * We will silently add sensai artofacts to the git ignore file if it exists.
 */

const setupGitIgnore = async (rootPath: string = process.cwd()) => {
  const filePath = join(rootPath, ".gitignore");
  if (await hasFile(filePath)) {
    const gitignore = await readFile(filePath, "utf-8");
    const hasIgnore = artifactsRegexp.test(gitignore);
    if (!hasIgnore) {
      await write(
        filePath,
        `${gitignore}\n\n# Sensai build artifacts\n.${ARTIFACTS_NAMESPACE}/`
      );
    }
  }
};
