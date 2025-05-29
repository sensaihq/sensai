import { describe, it as test } from "node:test";
import assert from "node:assert";
import guard, { getHandlerOptions } from "@/src/lib/guard";
import { type JSONSchema7 } from "./schema";

describe("guard", () => {
  // Test basic functionality of guard
  test("should wrap a handler function", async () => {
    const wrappedHandler = guard((data: any) => {
      return { success: true, data };
    });
    assert.equal(typeof wrappedHandler, "function");
    const result = await wrappedHandler({ name: "test" });
    assert.deepStrictEqual(result, { success: true, data: { name: "test" } });
  });

  // Test with input schema
  test("should pass validated data to the handler", async () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    };
    const wrappedHandler = guard(
      (data: any) => {
        return { received: data };
      },
      { input: schema }
    );
    const result = await wrappedHandler({ name: "John", age: 30 });
    assert.deepStrictEqual(result, { received: { name: "John", age: 30 } });
  });

  // Test with additional arguments
  test("should pass additional arguments to the handler", async () => {
    const wrappedHandler = guard((data: any, ...args: any[]) => {
      return { data, args };
    });
    const result = await wrappedHandler({ name: "test" }, "extra", 42);
    assert.deepStrictEqual(result, {
      data: { name: "test" },
      args: ["extra", 42],
    });
  });

  // Test with 'this' context
  test("should preserve 'this' context", async () => {
    // Create an object with a method
    const obj = {
      value: "context value",
      handler(data: any) {
        return { data, contextValue: this.value };
      },
    };

    // Wrap the handler with guard
    const wrappedHandler = guard(obj.handler);

    // Test with binding to the object
    const result = await wrappedHandler.call(obj, { name: "test" });
    assert.deepStrictEqual(result, {
      data: { name: "test" },
      contextValue: "context value",
    });
  });

  // Test getHandlerOptions
  test("should store and retrieve options", async () => {
    const options = {
      description: "Test handler",
      input: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      } as JSONSchema7,
    };
    const wrappedHandler = guard((data: any) => data, options);
    const retrievedOptions = getHandlerOptions(wrappedHandler as any);
    assert.deepStrictEqual(retrievedOptions, options);
  });

  // Test with no options
  test("should work with no options", async () => {
    // Wrap the handler with guard but no options
    const wrappedHandler = guard((data: any) => data);

    // Test the wrapped handler
    const result = await wrappedHandler({ name: "test" });
    assert.deepStrictEqual(result, { name: "test" });

    // Verify options are an empty object
    const retrievedOptions = getHandlerOptions(wrappedHandler as any);
    assert.deepStrictEqual(retrievedOptions, {});
  });

  // Test that options are non-enumerable
  test("should make options non-enumerable", async () => {
    const wrappedHandler = guard((data: any) => data, {
      description: "Test",
    });

    // Check that the options are not enumerable
    const props = Object.keys(wrappedHandler);
    assert.strictEqual(props.length, 0);

    // But we can still get them with getHandlerOptions
    const options = getHandlerOptions(wrappedHandler as any);
    assert.strictEqual(options.description, "Test");
  });
});
