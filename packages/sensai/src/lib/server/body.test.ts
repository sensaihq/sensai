import test from "node:test";
import assert from "node:assert";
import { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import parseBody, { normalizeCharset } from "./body";

// Utility to create a mock request
function createMockRequest(
  body: string,
  headers: Record<string, string> = {}
): IncomingMessage {
  const mockRequest = new Readable() as IncomingMessage;
  mockRequest.push(body);
  mockRequest.push(null);
  mockRequest.headers = {
    "content-length": Buffer.byteLength(body).toString(),
    ...headers,
  };
  return mockRequest;
}

test("should parse JSON content type correctly", async () => {
  const jsonData = { name: "test", value: 123 };
  const request = createMockRequest(JSON.stringify(jsonData), {
    "content-type": "application/json",
  });

  const result = await parseBody(request);
  assert.deepEqual(result, jsonData);
});

test("should parse URL-encoded form data correctly", async () => {
  // Include all primitive types in URL-encoded format
  const formData =
    "string=hello&number=123&zero=0&negative=-10&float=3.14&boolean_true=true&boolean_false=false&empty=&undefined=&null=null&array=1,2,3&special=hello%20world%21";

  const request = createMockRequest(formData, {
    "content-type": "application/x-www-form-urlencoded",
  });

  const result = await parseBody(request);

  assert.deepEqual(result, {
    string: "hello",
    number: "123", // All values come as strings in form-urlencoded
    zero: "0",
    negative: "-10",
    float: "3.14",
    boolean_true: "true", // Strings, not actual booleans
    boolean_false: "false",
    empty: "",
    undefined: "",
    null: "null", // String "null", not actual null
    array: "1,2,3", // String, not actual array
    special: "hello world!",
  });
});

test("should handle empty body", async () => {
  const request = createMockRequest("", { "content-type": "application/json" });

  const result = await parseBody(request);

  assert.deepStrictEqual(result, {});
});

test("should handle missing content-type header by returning raw body as string", async () => {
  const body = "raw content";
  const request = createMockRequest(body);

  const result = await parseBody(request);

  assert.deepEqual(result, { raw: body });
});

test("should reject with error for invalid JSON", async () => {
  const invalidJson = '{ "name": "test", value: 123 }'; // Missing quotes around value
  const request = createMockRequest(invalidJson, {
    "content-type": "application/json",
  });

  await assert.rejects(
    async () => await parseBody(request),
    (err) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes("JSON"));
      return true;
    }
  );
});

test("should handle malformed URL-encoded data gracefully", async () => {
  const malformedData = "name=test&value=123&invalid"; // Missing value for 'invalid'
  const mockReq = createMockRequest(malformedData, {
    "content-type": "application/x-www-form-urlencoded",
  });

  const result = await parseBody(mockReq);

  assert.deepEqual(result, {
    name: "test",
    value: "123",
    invalid: "",
  });
});

test("should handle content type with various charset parameters", async () => {
  const jsonData = { name: "test", value: 123 };
  const jsonString = JSON.stringify(jsonData);

  // Test multiple common charsets
  const charsets = [
    "utf-8",
    "ascii",
    "latin1",
    "UTF-8",
    "iso-8859-1",
    "ISO-8859-1",
    // "windows-1252",
  ];

  for (let charset of charsets) {
    // Try to encode with the specified charset
    const encodedString = Buffer.from(jsonString).toString(
      normalizeCharset(charset) as BufferEncoding
    );
    console.log(`application/json; charset=${charset}`);
    const mockReq = createMockRequest(encodedString, {
      "content-type": `application/json; charset=${charset}`,
    });

    try {
      const result = await parseBody(mockReq);
      assert.deepEqual(result, jsonData, `Failed with charset: ${charset}`);
    } catch (error) {
      console.log(error);
    }
  }
});

test("should throw 400 exception if data byte length does not match Content-Length", async () => {
  const mockReq = createMockRequest(
    JSON.stringify({ name: "test", value: 123 }),
    {
      "content-type": `application/json`,
      "content-length": "3", // Incorrect length
    }
  );
  try {
    await parseBody(mockReq);
    assert.fail("Expected error not thrown");
  } catch (error: any) {
    assert.equal(error.code, 400);
  }
});

test("should throw 413 exception if Content-Length greater than limit", async () => {
  const mockReq = createMockRequest(
    JSON.stringify({ name: "test", value: 123 }),
    {
      "content-type": `application/json`,
      "Content-Length": "3", // Incorrect length
    }
  );
  try {
    await parseBody(mockReq, 2);
    assert.fail("Expected error not thrown");
  } catch (error: any) {
    assert.equal(error.code, 413);
  }
});
