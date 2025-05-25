// Utils
import test from "node:test";
import assert from "node:assert";
import router from "@/src/lib/router";
import { dirname } from "node:path";

test("should find static route", async () => {
  const { add, lookup } = await router();
  add("/api/route.get.ts");
  const { resource, middlewares, path, params } = lookup("/api");
  assert.equal(path, "/api");
  assert.deepEqual(params, {});
  const { route, type } = resource["GET"].default;
  assert.equal(route, "/api/route.get.ts");
  assert.equal(type, "route");
  assert.deepEqual(middlewares, []);
});

test("should find multiple static routes with same pathname", async () => {
  const { add, lookup } = await router();
  add("/api/route.ts");
  add("/api/route.post.ts");
  add("/api/route.get.ts");
  for (const method of ["ANY", "GET", "POST"]) {
    const { middlewares, resource, path, params } = lookup("/api");
    assert.equal(path, "/api");
    assert.deepEqual(params, {});
    const { route, type } = resource[method].default;
    assert.equal(
      route,
      `/api/route${method === "ANY" ? "" : `.${method.toLowerCase()}`}.ts`
    );
    assert.equal(type, "route");
    assert.deepEqual(middlewares, []);
  }
});

test("should find static route with middlewares", async () => {
  const { add, lookup } = await router();
  add("/api/route.put.ts");
  add("/api/authorizer.ts");
  const { resource, middlewares, path, params } = lookup("/api");

  assert.equal(path, "/api");
  assert.deepEqual(params, {});
  const { route, type } = resource["PUT"].default;
  assert.equal(route, "/api/route.put.ts");
  assert.equal(type, "route");
  assert.deepEqual(middlewares, ["/api/authorizer.ts"]);
});

test("should find static route with version", async () => {
  const { add, lookup } = await router();
  add("/api/route.get.ts");
  add("/api/@v2/route.get.ts");
  add("/api/@v3/route.ts");
  const versions = ["default", "v2"];
  for (const version of versions) {
    const { middlewares, resource, path, params } = lookup("/api");
    assert.equal(path, "/api");
    assert.deepEqual(params, {});
    const { route, type } = resource["GET"][version];
    assert.equal(
      route,
      `/api${version === "default" ? "" : "/@v2"}/route.get.ts`
    );
    assert.equal(type, "route");
    assert.deepEqual(middlewares, []);
  }
  const { middlewares, resource, path, params } = lookup("/api");
  assert.equal(path, "/api");
  assert.deepEqual(params, {});
  const { route, type } = resource["ANY"]["v3"];
  assert.equal(route, `/api/@v3/route.ts`);
  assert.equal(type, "route");
  assert.deepEqual(middlewares, []);
});

test("should return route path relative to a root directory", async () => {
  const { add, lookup } = await router("/hello/world");
  add("/api/route.get.ts");
  const { resource, middlewares, path, params } = lookup("/api");
  assert.equal(path, "/api");
  assert.deepEqual(params, {});
  const { route, type } = resource["GET"].default;
  assert.equal(route, "/hello/world/api/route.get.ts");
  assert.equal(type, "route");
  assert.deepEqual(middlewares, []);
});

test("should remove static route", async () => {
  const { add, lookup, remove } = await router();
  add("/api/route.get.ts");
  add("/api/route.post.ts");
  add("/api/hello/route.post.ts");
  assert.equal(remove("/api/route.get.ts"), true);
  const { resource } = lookup("/api");
  assert.equal(resource["GET"] == null, true);
  assert.equal(resource["POST"] != null, true);
  assert.equal(remove("/api/route.post.ts"), true);
  assert.equal(lookup("/api") == null, true);
  assert.equal(lookup("/api/hello") != null, true);
});

test("should remove parametric routes", async () => {
  const routes = [
    "/api/[name]/route.get.ts",
    "/api/[...names]/route.get.ts",
    "/api/[[...names]]/route.get.ts",
  ];
  for (const route of routes) {
    const { add, lookup, remove } = await router();
    add(route);
    assert.equal(remove(route), true);
    assert.equal(lookup("/api/olivier") == null, true);
  }
});

test("should delete folder of routes", async () => {
  const { add, lookup, prune } = await router();
  add("/api/hello/route.get.ts");
  add("/api/hello/route.post.ts");
  add("/api/hello/[name]/route.get.ts");

  assert.equal(lookup("/api/hello") != null, true);
  assert.equal(lookup("/api/hello/olivier") != null, true);
  assert.equal(prune("/api/hello"), true);
  assert.equal(lookup("/api/hello") == null, true);
  assert.equal(lookup("/api/hello/olivier") == null, true);
});

test("should add an agent prompt", async () => {
  const { add, lookup } = await router();
  const filenames = [
    "/api/prompt.md",
    "/api/hello/prompt.md",
    "/api/hello/world/prompt.md",
  ];
  for (const file of filenames) {
    add(file);
    const url = dirname(file);
    console.log("URL", url);
    const { resource, middlewares, path, params } = lookup(url);
    assert.equal(path, url);
    assert.deepEqual(params, {});
    const { route, type } = resource["ANY"].default;
    assert.equal(route, file);
    assert.equal(type, "prompt");
    assert.deepEqual(middlewares, []);
  }
});

// TODO add tests for prompt.{ts, js, json, yml}

test("should add tools", async () => {
  const { add, lookup } = await router();
  add("/api/tool.hello.ts");
  add("/api/tool.weather.ts");
  // test the tools file are added no matter what
  assert.equal(lookup("/api") == null, true);
  add("/api/prompt.md");
  const { tool } = lookup("/api").resource;
  assert.deepEqual(
    tool.sort((a, b) => a.name.localeCompare(b.name)),
    [
      { name: "hello", path: "/api/tool.hello.ts" },
      { name: "weather", path: "/api/tool.weather.ts" },
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
});
