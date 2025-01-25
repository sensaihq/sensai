import ora from "ora";
import { execSync } from "node:child_process";

/**
 * Install dependencies and print report.
 */

export const installDependencies = (
  packageManager: string,
  cwdPath: string
) => {
  // TODO compare with adding sensai as dev depenencies and copying first
  // into node modules
  const spinner = ora("Installing dependencies...").start();
  execSync(`${packageManager} install`, { cwd: cwdPath });
  spinner.stop();
};

/**
 * Get package manager.
 */

export const getPackageManager = (): string => {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
};
