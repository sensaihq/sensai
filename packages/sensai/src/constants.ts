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

export const ARTIFACTS_NAMESPACE = "sensai";
export const ENV_NAMESPACE = "SENSAI_ENV";
export enum SENSAI_ENV {
  DEV = "development",
  PROD = "production",
  TEST = "testing",
}

export const HTTP_GET = "GET";
export const HTTP_HEAD = "HEAD";
export const HTTP_ANY = "ANY";
export const HTTP_DEFAULT_METHOD = HTTP_GET;

export enum HTTP_STATUS {
  OK = 200,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  INTERNAL_ERROR = 500,
}

export enum MIME_TYPE {
  JSON = "application/json",
  MULTIPART = "multipart/form-data",
  //TEXT = 'text',
  URL = "application/x-www-form-urlencoded",
}

export const VERSION_DEFAULT = "default";

// different route files in file-system
export enum FILE_TYPE {
  MOCK = "mock",
  PROMPT = "prompt",
  ROUTE = "route",
  MIDDLEWARE = "middleware",
  AUTHORIZER = "authorizer",
  TOOL = "tool",
}
