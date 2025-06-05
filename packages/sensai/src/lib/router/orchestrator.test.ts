import { describe, it } from "node:test";
import assert from "node:assert";
import orchestrator from "@/src/lib/router/orchestrator";
import { join, sep } from "node:path";

describe("orchestrator", () => {
  it("should add and get orchestrated agents", () => {
    const { add, get } = orchestrator();
    const path1 = join(sep, "api", "agent1", "prompt.md");
    add(path1);
    const path2 = join(sep, "api", "agent2", "prompt.md");
    add(path2);
    assert.deepEqual(get(join(sep, "api")), {
      agent1: path1,
      agent2: path2,
    });
  });

  it("should remove agent from the orchestrator", () => {
    const { add, get, remove } = orchestrator();
    const path1 = join(sep, "api", "agent1", "prompt.md");
    add(path1);
    const path2 = join(sep, "api", "agent2", "prompt.md");
    add(path2);
    remove(path1);
    assert.deepEqual(get(join(sep, "api")), {
      agent2: path2,
    });
  });

  it("should return empty object if no agents", () => {
    const { get } = orchestrator();
    assert.deepEqual(get(join(sep, "api")), {});
  });

  it("should support parametric segments in paths", () => {
    const { add, get } = orchestrator();
    const path1 = join(sep, "api", "[agent1]", "prompt.md");
    add(path1);
    const path2 = join(sep, "api", "[...agent2]", "prompt.md");
    add(path2);
    // optional catch all can not live alongside catch-all or slug but that does not matter here
    const path3 = join(sep, "api", "[[...agent3]]", "prompt.md");
    add(path3);
    assert.deepEqual(get(join(sep, "api")), {
      agent1: path1,
      agent2: path2,
      agent3: path3,
    });
  });
});
