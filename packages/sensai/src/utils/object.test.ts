import { describe, it } from "node:test";
import assert from "node:assert";
import { subtract, merge } from "@/src/utils/object";

describe("object utils", () => {
  describe("subtract", () => {
    it("should return empty object if nothing has changed", () => {
      assert.deepEqual(subtract({ a: 1, b: 2 }, { a: 1, b: 2 }), {});
    });

    it("should subtract two JSON objects with simple primitive properties", () => {
      assert.deepEqual(subtract({ a: 1, b: 3, c: 4 }, { a: 1, b: 2 }), {
        b: 3,
        c: 4,
      });
    });

    it("should subtract two JSON objects with object primitive properties", () => {
      assert.deepEqual(
        subtract({ a: 1, b: { c: 2, d: 3 }, e: 4 }, { a: 1, b: { c: 2 } }),
        { b: { c: 2, d: 3 }, e: 4 }
      );
    });
  });

  describe("merge", () => {
    it("should merge two objects together", () => {
      assert.deepEqual(
        merge(
          { a: 1, b: { c: 2, d: { e: 3 } }, f: 4 },
          { b: { c: 2, d: { e: 5, g: 9 } } }
        ),
        { a: 1, b: { c: 2, d: { e: 5, g: 9 } }, f: 4 }
      );
    });

    it("should merge array properties", () => {
      assert.deepEqual(
        merge(
          { a: 1, b: ["hello", "jane"], c: ["something"] },
          { b: ["world", "hello"] }
        ),
        {
          a: 1,
          b: ["hello", "jane", "world"],
          c: ["something"],
        }
      );
    });
  });
});
