import { join } from "node:path";

// constants
export const DEV_SERVER_DEFAULT_PORT = 3030;
export const PROD_SERVER_DEFAULT_PORT = 80;
export const DEV_DOC_PATH = join(__dirname, "../../../sensai-doc");

// enums
export enum SENSAI_COMMAND {
  DEV = "dev",
  START = "start",
  BUILD = "build",
}
