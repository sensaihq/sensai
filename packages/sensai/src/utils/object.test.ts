import { describe, it } from "node:test";
import assert from "node:assert";
import { merge } from "@/src/utils/object";

describe("object utils", () => {
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
