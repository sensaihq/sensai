export type SensaiConfig = {
  apiDir: string;
  port: number;
  watch: boolean;
};

export type SlugParams = Record<string, string | string[]>;

// asynchronous context
export type Context = {
  type: string;
  headers: Record<string, string>;
  status: {
    code: number;
    errorMessage?: string;
  };
};
