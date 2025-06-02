import test from "node:test";
import assert from "node:assert";
import metadata from "./metadata";

test("should extract metadata from file path", () => {
  const meta = metadata("/api/hello/route.ts");
  assert.equal(meta.pathname, "/api/hello");
  assert.equal(meta.filename, "route.ts");
  assert.equal(meta.method, "ANY");
  assert.equal(meta.version, "default");
});

test("should extract metadata from file with method", () => {
  const meta = metadata("/api/hello/route.post.ts");
  assert.equal(meta.pathname, "/api/hello");
  assert.equal(meta.filename, "route.post.ts");
  assert.equal(meta.method, "POST");
  assert.equal(meta.version, "default");
});

test("should extract metadata from file path with collection folder", () => {
  const meta = metadata("/api/(protected)/hello/route.ts");
  assert.equal(meta.pathname, "/api/hello");
  assert.equal(meta.filename, "route.ts");
  assert.equal(meta.method, "ANY");
  assert.equal(meta.version, "default");
});

test("should extract metadata from file path with slot/version folder", () => {
  const meta = metadata("/api/hello/@v2/route.get.ts");
  assert.equal(meta.pathname, "/api/hello");
  assert.equal(meta.filename, "route.get.ts");
  assert.equal(meta.method, "GET");
  assert.equal(meta.version, "v2");
});

test("all together", () => {
  const meta = metadata("/api/(protected)/hello/(group)/@v2/route.put.ts");
  assert.equal(meta.pathname, "/api/hello");
  assert.equal(meta.filename, "route.put.ts");
  assert.equal(meta.method, "PUT");
  assert.equal(meta.version, "v2");
});
