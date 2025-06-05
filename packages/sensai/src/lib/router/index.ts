import { basename, dirname, join } from "node:path";
import getMetadata from "@/src/lib/router/metadata";
import trie, { LookupT } from "@/src/lib/router/trie";
import middlewareMap from "@/src/lib/router/middlewares";
import orchestratorMap from "@/src/lib/router/orchestrator";
import { FILE_TYPE } from "@/src/constants";

type Tool = { name: string; path: string };

type Resource = {
  [method: string]: {
    [version: string]: {
      //middlewares: string[],
      route: string;
      type: string;
    };
  };
} & { tool?: Tool[] };

export type Router = {
  add: (filePath: string) => void;
  // addRoute: (routePath: string /*, middlewarePaths?: string[]*/) => void;
  // addMiddleware: (middlewarePath: string) => void;
  lookup: (urlPath: string) =>
    | (LookupT & {
        middlewares: string[];
        resource: Resource;
      })
    | undefined;
  getAgents: (folderPath: string) => string[];
  getTools: (folderPath: string) => Tool[];
  remove: (filepath: string) => boolean;
  prune: (folderPath: string) => boolean;
};

/**
 * Create a resource based router where route are grouped by verbs/methods
 * and versions.
 *
 * @param rootDir directory used to create absolute path for route filepath
 */
export default async (rootDir: string = ""): Promise<Router> => {
  const resources = new Map<string, Resource>();
  const middlewares = middlewareMap();
  const orchestrator = orchestratorMap();
  const routes = trie();

  /**
   * Add route with its optional middleware in the router/resource resolution.
   */

  const addRoute = (routePath: string, type: FILE_TYPE) => {
    const { pathname, method, version } = getMetadata(routePath);
    //const relativePath = relative(rootDir, pathname) || '/'
    const relativePath = pathname;

    const endpoint = resources.get(relativePath) || {};
    resources.set(relativePath, {
      ...endpoint,
      [method]: {
        ...endpoint[method],
        [version]: {
          // TODO the join rootDIr should be donei walker
          // middlewares: middlewarePaths.map((path) => join(rootDir, path)),
          route: join(rootDir, routePath),
          type,
        },
      },
    });
    routes.add(relativePath);
  };

  const addTool = (toolPath: string) => {
    const filename = basename(toolPath); // TODO merge with get metadata
    const chunks = filename.split(".");
    if (chunks.length === 3) {
      const dirPath = dirname(toolPath);
      const resource = resources.get(dirPath) || {};
      resources.set(dirPath, {
        ...resource,
        tool: [{ name: chunks[1], path: toolPath }, ...(resource.tool || [])],
      } as Resource);
    }
  };

  return {
    add(filePath: string) {
      const prefix = getPrefix(filePath);
      switch (prefix) {
        case FILE_TYPE.MIDDLEWARE:
        case FILE_TYPE.AUTHORIZER:
          middlewares.add(filePath);
          break;
        case FILE_TYPE.ROUTE:
        case FILE_TYPE.MOCK:
        case FILE_TYPE.PROMPT:
        case FILE_TYPE.ORCHESTRATOR:
          addRoute(filePath, prefix);
          orchestrator.add(filePath);
          break;
        case FILE_TYPE.TOOL:
          addTool(filePath);
          break;
      }
    },

    /**
     * An orchestrator can use agents as tools to create multi-agent
     * orchetration.
     */

    getAgents(folderPath: string) {
      return [];
    },

    /**
     * Tools apply to a resource (i.e collection of routes under a URL segment).
     */

    getTools(folderPath: string) {
      const resource = resources.get(folderPath.substring(rootDir.length));
      return resource?.tool || [];
    },

    /**
     * Lookup a path in the router Map.
     */

    lookup(urlPath: string) {
      // TODO only use sanitizedUrl if we don't find anything int he static cache
      //const sanitizedUrl = sanitize(urlPath)
      //return resources.get(urlPath)

      const route = routes.lookup(urlPath);
      if (route) {
        const resource = resources.get(route.path);
        if (resource) {
          return {
            ...route,
            resource,
            // TODO we should move middlewares to build time (i.e NOT when fetching route)
            // TODO map/join is not efficient
            middlewares: middlewares
              .get(route.path + "/tmp.ts")
              .map((path) => join(rootDir, path)),
          };
        }
      }
    },

    /**
     * Remove a file from the router.
     */

    remove(filePath: string) {
      const prefix = getPrefix(filePath);
      switch (prefix) {
        case FILE_TYPE.MIDDLEWARE:
        case FILE_TYPE.AUTHORIZER: {
          middlewares.remove(filePath);
          return true;
        }
        case FILE_TYPE.ROUTE:
        case FILE_TYPE.MOCK:
        case FILE_TYPE.PROMPT: {
          const { pathname, method } = getMetadata(filePath); // TODO we should look at version
          const endpoint = resources.get(pathname);
          delete endpoint[method];
          if (Object.keys(endpoint).length < 1) {
            routes.remove(pathname);
            resources.delete(pathname);
          }
          return true;
        }
      }
      return false;
    },

    /**
     * // TODO remove if not needed
     * Remove all files in a folder
     */

    prune(folderPath: string) {
      resources.delete(folderPath);
      return routes.remove(folderPath, true);
    },
  };
};

/**
 * Return file prefix.
 *
 * @examples
 *
 *   getPrefix('route.get.ts')
 *   // => 'route'
 *   getPrefix('route.ts')
 *   // => 'route'
 *   getPrefix('prompt.name.world.md')
 *   // => 'prompt'
 */

const getPrefix = (filePath: string) => {
  return basename(filePath).split(".")[0];
};
