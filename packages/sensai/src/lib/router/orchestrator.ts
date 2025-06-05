import { dirname, basename } from "node:path";
import { DYNAMIC_SEGMENT_REGEXP } from "@/src/constants";

export default () => {
  const map = {};
  return {
    /**
     * Add agent to orchestrator layer.
     *
     * When router finds an `orchestrator` file, it will look for agents that
     * live in the same directory. I.e we need to map agents with their parent URL segment.
     */

    add(agentFilePath: string) {
      const agentPath = dirname(agentFilePath);
      const parentPath = dirname(agentPath);
      const name = getFolderName(agentPath);
      map[parentPath] ??= {};
      map[parentPath][name] ??= agentFilePath;
    },

    /**
     * Return list of agents that apply to a given orchestrator file.
     *
     * @notes we are not gonna check the file is `orchestrator(.ts|js|md)` but instead
     * trust that's the case.
     */

    get(dir: string): Record<string, string> {
      return map[dir] || {};
    },

    remove(agentFilePath: string) {
      const agentPath = dirname(agentFilePath);
      const parentPath = dirname(agentPath);
      const name = basename(agentPath);
      if (map[parentPath]) {
        delete map[parentPath][name];
      }
    },
  };
};

/**
 * Extract the folder name from a path, handling special cases like
 * single/double brackets and ellipses.
 */

const getFolderName = (folderPath: string) => {
  const name = basename(folderPath);
  const matches = name.match(DYNAMIC_SEGMENT_REGEXP);
  return matches ? matches[3] : name;
};
