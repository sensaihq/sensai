import { validateAndCoerce, type JSONSchema7 } from "@/src/lib/schema";

// symbol use to add properties to handler
const symbol = Symbol("guard");

/**
 * A guard is a function that wraps a handler and adds input/output
 * validation and other features.
 */

export default function <T extends Handler>(
  handler: T,
  options?: GuardOptions
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return hideProperties(async function (this: any, props, ...args) {
    const data = options?.input
      ? await validateAndCoerce(props, options.input)
      : props;
    return await handler.call(this, data, ...args);
  }, options || {}) as (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

/**
 * Using an encapsulated symbol forces third parties to use `guard` to create
 * plugins and ensure their compatibility with the framework.
 */

export const getHandlerOptions = <T extends GuardOptions>(
  fn: Handler & { [symbol]: T }
): GuardOptions | undefined => {
  return fn[symbol];
};

/**
 * Guard needs to return a function so we can import a route, a tool,
 * etc in a test suite and execute code directly. This is why we adding
 * the guard options (used for compilation and run time) as non-emurable
 * properties to the function.
 */

const hideProperties = (fn: Handler, value: GuardOptions) => {
  return Object.defineProperty(fn, symbol, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  });
};

type GuardOptions = {
  description?: string;
  input?: JSONSchema7;
  output?: JSONSchema7;
};
type Input<K extends keyof any, T> = { [P in K]: T };
export type Handler = (data: Input<string, unknown>) => unknown;
