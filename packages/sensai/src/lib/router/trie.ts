// radix-like node
type TrieT = {
  end: boolean
  metadata: DynamicSegmentT[]
  segments: {
    [segment: string]: TrieT
  }
}

// dynamic segment
type DynamicSegmentT = {
  key: string
  name: string
  level: number
}

// segment params
type ParamsT = Record<string, string | string[]>

export type LookupT = {
  path: string,
  params: ParamsT
}

export default (tree: TrieT = createNode()) => {
  return {

    /**
     * Add tree branch.
     * A branch is made of segments that are either static or dynamic. The last 
     * segment is marked as the end of a branch. 
     * A dynamic segment can be:
     *   - `parametric` (single segment value swapping)
     *   - `catch-all` (multiple segments value swapping)
     *   - `optional catch-all` (zero or multiple segments value swapping)
     * 
     * @examples
     * 
     *   add('/')
     *   add('/hello)
     *   add('/hello/[name])
     *   add('/hello/[...names])
     *   // optional catch-all
     *   add('/hello/[[...names]])
     */

    add(folderPath: string): boolean {
      let current = tree
      for (const segment of folderPath.split('/')) {
        if (segment) {
          let child = current.segments[segment]
          if (!child) {
            child = current.segments[segment] = createNode()
            // add metadata for new nodes
            const dynamicSegment = getDynamic(segment)
            if (dynamicSegment) {
              current.metadata = prioritize(current.metadata, dynamicSegment)
            }
          }
          current = child
        }
      }
      current.end = true
      return true
    },

    /**
     * This method is used for test purpose so we could check if a node 
     * was created in the tree with the right attributes (i.e `end`, `metadata` and `segments`).
     * @private 
     */

    get(folderPath: string): TrieT | undefined {
      let current = tree
      for (const segment of folderPath.split('/')) {
        if (segment) {
          let child = current.segments[segment]
          if (!child) return
          current = child
        }
      }
      return current
    },

    /**
     * Get radix-like tree.
     */

    getTree(): TrieT {
      return tree
    },

    /**
     * Lookup a path in the tree.
     * Path segments are compared to segment in the tree and values are swapped 
     * if needed (see examples).
     * 
     * @examples
     *   // static
     *   add('/hello')
     *   lookup('/hello')
     *   // => { path: '/hello', params: {}}
     * 
     *   // parametric
     *   add('/hello/[name]')
     *   lookup('/hello/world')
     *   // => { path: '/hello/[name]', params: { name: 'world' }}
     * 
     *   // catch-all
     *   add('/hello/[...names]')
     *   lookup('/hello/john/jane')
     *   // => { path: '/hello/[...names]', params: { names: ['john', 'jane'] }}
     *   add('/hello/[name]')
     *   lookup('/hello/john/jane')
     *   // => undefined // TODO we could return /hello/[...names]
     *   lookup('/hello/john')
     *   // => { path: '/hello/[name]', params: { name: 'john' }}
     * 
     *   // optional catch-all
     *   add('/hello/[[...names]]')
     *   lookup('/hello/john/jane')
     *   // => { path: '/hello/[...names]', params: { names: ['john', 'jane'] }}
     *   lookup('/hello')
     *   // => { path: '/hello/[...names]', params: { names: [] }}
     *   // static segments are more specific
     *   add('/hello')
     *   lookup('/hello')
     *   // => { path: '/hello/', params: {}}
     */

    lookup(urlPath: string): LookupT | void {
      let current = tree
      const params: ParamsT = {}
      let path = ''
      const segments = urlPath.split('/')
      for (let i = 0, l = segments.length; i < l; i++) {
        const segment = segments[i]
        if (segment) {
          let child = current.segments[segment]
          // Check if there's a static match first
          if (child && child.end) {
            current = child
            path += '/' + segment
            continue
          } 
          
          // If static node exists but it's not a route endpoint (end=false),
          // or if no static node exists, check for dynamic segments
          const dynamicSegment = current.metadata[0]
          if (dynamicSegment) {
            const { name, key, level } = dynamicSegment
            const dynamicNode = current.segments[name]
            if (!dynamicNode) return; // Dynamic segment doesn't exist
            
            current = dynamicNode
            path += '/' + name
            if (level === 1) {
              params[key] = segment
              continue
            } else {
              params[key] = segments.slice(i).filter(Boolean) // TODO we assume url is not sanitized, should we?
              break
            }
          } else if (child) {
            // There's a static match but it's not an endpoint
            current = child
            path += '/' + segment
          } else {
            // No match at all
            return
          }
        }
      }
      if (current.end) {
        return { path: path || '/', params }
      } else {
        const dynamicSegment = current.metadata[0]
        if (dynamicSegment) {
          const { name, key, level } = dynamicSegment
          if (level === 3) { // if optional
            const dynamicNode = current.segments[name]
            // if optional was removed or doesn't exist
            if (!dynamicNode || !dynamicNode.end) return undefined
            return {
              path: path + '/' + name,
              params: {
                ...params,
                [key]: []
              }
            }
          }
        }
      }
    },

    /**
     * Remove branch from the tree.
     * The entire algorithm is based on file-system and while we can remove a branch, it does 
     * not mean a folder is removed (the `isRecursive` argument allows to delete nodes from a branch).
     */

    remove(folderPath: string, isRecursive: boolean = false): boolean {
      let current = tree
      var segment: string = ''
      let parent
      for (segment of folderPath.split('/')) {
        if (segment) {
          parent = current
          let child = current.segments[segment]
          if (!child) return false
          current = child
        }
      }
      current.end = false
      if (isRecursive) {
        // remove child segment and metadata if exists
        if (parent && segment) {
          delete parent.segments[segment]
          parent.metadata = parent.metadata.filter((dynamic) => dynamic.name !== segment)
        }
      }
      return true
    }
  }
}

/**
 * Create tree node.
 * The `metadata` attribute contains information about dynamic children nodes.
 */

const createNode = (): TrieT => {
  return { end: false, metadata: [], segments: {} }
}

/**
 * Get dynamic segment metadata.
 */

const getDynamic = (segment: string): DynamicSegmentT | void => {
  const matches = segment.match(/^(\[{1,2})(\.\.\.)?([^\[\]]+)(\]{1,2})$/)
  if (matches) {
    const isCatchAll = !!matches[2]
    let level = 1
    if (isCatchAll) {
      level = 2
      if (matches[1] === '[[' && isCatchAll) level = 3
    }
    return {
      key: matches[3],
      name: segment,
      level
    }
  }
}

/**
 * Add new dynamic parameters to a stack and sort it by priority
 * and name (for parameters of same level).
 */

const prioritize = (stack: DynamicSegmentT[], dynamic: DynamicSegmentT): DynamicSegmentT[] => {
  stack.splice(0, 0, dynamic)
  return stack.sort((a, b) => {
    if (a.level === b.level) {  // when levels are the same, sort by name
      return a.name.localeCompare(b.name)
    } else {  // otherwise, sort by level
      return a.level - b.level
    }
  })
}