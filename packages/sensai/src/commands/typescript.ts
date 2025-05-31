import { mkdir, readFile } from "fs/promises";
import { join } from "node:path";
import { write } from "@/src/utils/fs";
import { access, constants as fsConstants } from "node:fs/promises";
import { ARTIFACTS_NAMESPACE } from "@/src/constants";
import { execSync } from "child_process";

export default async () => {
  const rootPath = process.cwd();
  await initializeArtifacts(rootPath);

  try {
    if (await hasTsConfig(rootPath)) {
      await updateTsConfig(rootPath);
    } else {
      await initializeTsConfig(rootPath);
    }

    await checkAndUpdatePackageJson(rootPath);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Error: tsconfig.json is malformatted. ${error.message}`);
    }
    throw error;
  }
};

const initializeArtifacts = async (rootPath: string): Promise<void> => {
  console.log("INITIALIZING ARTIFACTS FOR TYPESCRIPT");
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

const hasTsConfig = async (rootPath: string): Promise<boolean> => {
  // check if tsconfig.json exists in the root directory
  try {
    await access(join(rootPath, "tsconfig.json"), fsConstants.F_OK);
    return true;
  } catch (error) {
    console.log("DOES NOT HAVE TYPESCRIPT CONFIGURATION");
    return false;
  }
};

const updateTsConfig = async (rootPath: string): Promise<void> => {
  console.log("CHECKING TYPESCRIPT CONFIGURATION");
  const tsConfigPath = join(rootPath, "tsconfig.json");

  try {
    // Read the existing tsconfig.json file
    const tsConfigContent = await readFile(tsConfigPath, "utf8");
    let tsConfig: any;

    try {
      tsConfig = JSON.parse(tsConfigContent);
    } catch (error) {
      throw new SyntaxError(
        `Failed to parse tsconfig.json: ${(error as Error).message}`
      );
    }

    // Check if include property exists
    if (!tsConfig.include) {
      tsConfig.include = [".sensai/types/**/*.ts", "**/*.ts", "**/*.tsx"];
      console.log("ADDED INCLUDE PROPERTY TO TSCONFIG");
    } else if (Array.isArray(tsConfig.include)) {
      // Check if .sensai/types/**/*.ts is already in the include array
      if (!tsConfig.include.includes(".sensai/types/**/*.ts")) {
        tsConfig.include.push(".sensai/types/**/*.ts");
        console.log("ADDED .SENSAI/TYPES/**/*.TS TO INCLUDE");
      }
    }

    // Write the updated tsconfig.json back to the file
    await write(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw error;
    }
    console.error("ERROR UPDATING TSCONFIG:", error);
    throw new Error(
      `Failed to update tsconfig.json: ${(error as Error).message}`
    );
  }
};

/**
 * Main function to check and update package.json with TypeScript dependencies
 */
const checkAndUpdatePackageJson = async (rootPath: string): Promise<void> => {
  console.log("CHECKING PACKAGE.JSON FOR TYPESCRIPT DEPENDENCIES");
  const packageJsonPath = join(rootPath, "package.json");

  try {
    // Check if package.json exists
    await access(packageJsonPath, fsConstants.F_OK);

    // Read and parse the package.json file
    const packageJson = await readPackageJson(packageJsonPath);

    // Check and update dependencies if needed
    const { updated, updatedPackageJson } =
      checkTypeScriptDependencies(packageJson);

    if (updated) {
      // Write the updated package.json
      await writePackageJson(packageJsonPath, updatedPackageJson);
      // Install the dependencies
      await installDependencies(rootPath);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to")) {
      throw error;
    }
    console.error("ERROR CHECKING PACKAGE.JSON:", error);
    throw new Error(
      `Failed to check package.json: ${(error as Error).message}`
    );
  }
};

/**
 * Read and parse the package.json file
 */
const readPackageJson = async (packageJsonPath: string): Promise<any> => {
  try {
    const packageJsonContent = await readFile(packageJsonPath, "utf8");
    return JSON.parse(packageJsonContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse package.json: ${error.message}`);
    }
    throw new Error(`Failed to read package.json: ${(error as Error).message}`);
  }
};

/**
 * Check if TypeScript dependencies need to be added
 */
const checkTypeScriptDependencies = (
  packageJson: any
): { updated: boolean; updatedPackageJson: any } => {
  // Create a copy of the package.json to avoid mutating the original
  const updatedPackageJson = { ...packageJson };

  // Initialize devDependencies if it doesn't exist
  if (!updatedPackageJson.devDependencies) {
    updatedPackageJson.devDependencies = {};
  }

  let updated = false;

  // Check for typescript
  if (!updatedPackageJson.devDependencies.typescript) {
    updatedPackageJson.devDependencies.typescript = "^5.0.0";
    updated = true;
  }

  // Check for @types/node
  if (!updatedPackageJson.devDependencies["@types/node"]) {
    updatedPackageJson.devDependencies["@types/node"] = "^20.0.0";
    updated = true;
  }

  return { updated, updatedPackageJson };
};

/**
 * Write the updated package.json back to the file
 */
const writePackageJson = async (
  packageJsonPath: string,
  packageJson: any
): Promise<void> => {
  try {
    await write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("UPDATED PACKAGE.JSON WITH TYPESCRIPT DEPENDENCIES");
  } catch (error) {
    throw new Error(
      `Failed to write package.json: ${(error as Error).message}`
    );
  }
};

/**
 * Install dependencies using npm
 */
const installDependencies = async (rootPath: string): Promise<void> => {
  console.log("INSTALLING TYPESCRIPT DEPENDENCIES");
  try {
    execSync("npm install", { cwd: rootPath, stdio: "inherit" });
  } catch (error) {
    console.error("ERROR INSTALLING DEPENDENCIES:", error);
    throw new Error(
      `Failed to install dependencies: ${(error as Error).message}`
    );
  }
};

const initializeTsConfig = async (rootPath: string): Promise<void> => {
  console.log("INITIALIZING TYPESCRIPT CONFIGURATION");
  await write(
    join(rootPath, "tsconfig.json"),
    `
    {
      "$schema": "https://json.schemastore.org/tsconfig",
      "compilerOptions": {

      },
      "exclude": [
        "node_modules",
        "dist"
      ],
      "include": [
        ".sensai/types/**/*.ts",
        "**/*.ts",
        "**/*.tsx"
      ]
    }
      `
  );
};
