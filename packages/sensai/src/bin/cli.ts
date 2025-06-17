#!/usr/bin/env node
import { spawn } from "node:child_process";
import { join } from "node:path";
import { SENSAI_COMMAND, SENSAI_ENV } from "@/src/constants";

const argv = process.argv.slice(2);

const spawnSensai = (sensaiEnv: SENSAI_ENV) => {
  const sensaiPath = join(__dirname, "../../src/bin/sensai.js");
  const child = spawn("node", [sensaiPath, ...argv], {
    env: {
      ...process.env,
      SENSAI_ENV: sensaiEnv,
    },
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (code != null) {
      process.exit(code);
    } else if (signal) {
      if (signal === "SIGKILL") {
        process.exit(137);
      } else {
        process.exit(1);
      }
    }
  });
};

(function () {
  switch (argv[0]) {
    case SENSAI_COMMAND.DEV:
      spawnSensai(SENSAI_ENV.DEV);
      break;
    default:
      spawnSensai(SENSAI_ENV.PROD);
      break;
  }
})();
