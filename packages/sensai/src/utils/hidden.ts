const symbol = Symbol("hidden");

/**
 * Set hidden property:
 *   - avoid name collision
 *   - create non-emurable property
 *   - add sensai metadata to a route, tool, mock or any prefix supported by sensai
 *
 * @param target - The object to attach the hidden property to
 * @param value - The value to store in the hidden property
 * @throws {TypeError} - If target is null, undefined, or not an object
 */

export const setHiddenProperty = <T, V>(target: T, value: V): void => {
  // Validate the target parameter
  // if (target == null) {
  //   throw new TypeError("Cannot set hidden property on null or undefined");
  // }

  // if (typeof target !== "object" && typeof target !== "function") {
  //   throw new TypeError("Target must be an object or function");
  // }

  // Use Object.defineProperty to create a truly hidden property
  Object.defineProperty(target, symbol, {
    value,
    enumerable: false, // Won't show up in Object.keys() or for...in loops
    configurable: false, // Can't be deleted or have its descriptor changed
    writable: false, // Can't be modified later if needed
  });
};

/**
 * Retrieves the hidden property from an object that was previously set
 * with setHiddenProperty.
 *
 * @param target - The object from which to retrieve the hidden property
 * @returns The value of the hidden property, or undefined if not found
 */

export const getHiddenProperty = <T, V>(target: T): V | undefined => {
  if (target === null || target === undefined) {
    return undefined;
  }

  return (target as any)[symbol] as V | undefined;
};
