import { dirname, sep, join } from "node:path"

export default () => {
  const map = {}
  return {
    /**
     * Add middleware.
     * 
     * @notes please note this module is private and we trust the parent will pass the right middleware 
     * files.
     */

    add(midPath: string) {
      const dirPath = dirname(midPath)
      const middlewares = map[dirPath] || []
      if (!middlewares.includes(midPath)) {
        middlewares.push(midPath)
        map[dirPath] = middlewares.sort()
      }
    },

    /**
     * Return list of middlewares that apply to a given file.
     */

    get(filePath: string): string[] {
      const middlewares = []
      const segments = dirname(filePath).split(sep).slice(1)
      let dirPath: string = sep
      for (const segment of segments) {
        dirPath = join(dirPath, segment)
        middlewares.push(...(map[dirPath] || []))
      }
      return middlewares
    },

    /**
     * Remove middleware.
     */

    remove(midPath: string) {
      const dirPath = dirname(midPath)
      const middlewares = map[dirPath]
      if (middlewares) {
        const index = middlewares.indexOf(midPath)
        if (index > -1) {
          middlewares.splice(index, 1)
        }
      }
      //delete map[dirname(midPath)]
    }
  }
}

