import { Readable, Stream, Transform, isReadable } from 'node:stream'

// TODO we should add validation at the template level
// ex: #{} is required ?{} is optional 
// TODO we should display a useful callstack if any error in template
// TODO we should have options to cache data

/**
 *  Dual interface templat engine:
 *   - supports and return async or stream
 *   - support template string or template strings array
 */

export default (
  template: string | TemplateStringsArray, 
  ...values: any[]
): any => {
  if (typeof template === 'string') {
    const [ chunks, patterns ] = compile(template) // TODO do something with params
    //const readable = createReadable(chunks)
    return (data: Record<string, any> = {}) => {
      const stream = createReadable(chunks).pipe(createTransform((i) => {
        const cb = patterns[i]
        if (cb) return cb(data)
      }))
      return Object.assign(stream, thenable(stream))
    }
  } else {
    const stream = createReadable(template)
      .pipe(createTransform((i) => values[i]))
    return Object.assign(stream, thenable(stream))
  }
}

/**
 * Extract chunks of strings from a template as well as the values
 * to insert.
 */

const compile = (str: string): [string[], Function[], string[]] => {
  const strings: string[] = []
  const patterns: Function[] = []
  const params: string[] = []
  const regex = /#\{([^}]+)\}/g
  let match;
  let idx = 0
  while ((match = regex.exec(str)) !== null) {
    const { index } = match
    strings.push(str.slice(idx, index))
    idx = index + match[0].length
    patterns.push(new Function('data', `return ${parse(match[1], params)}`))
  }
  strings.push(str.slice(idx))
  return [strings, patterns, params]
}

/**
 * Create a readable stream from chunks of strings.
 */

const createReadable = (chunks: string[] | TemplateStringsArray) => {
  return new Readable({
    read() {
      for (const chunk of chunks) {
        this.push(chunk)
      }
      this.push(null)
    }
  })
}

/**
 * Create transform stream used to inject data between chunks 
 * of strings.
 * 
 * @notes the transform is called one extra time with an undefined value 
 * as there is always one more chunk than values.
 */

const createTransform = (cb: (index: number) => any) => {
  let i = 0
  return new Transform({
    async transform(chunk, _, callback) {
      this.push(chunk)
      let value = await cb(i++)
      if (typeof value === 'function') value = value()
      if (isReadable(value)) {
        await promisify(value, (buff: Buffer) => this.push(buff))
      } else {
        const buff = await value
        this.push(buff == null ? '' : String(buff))
      }
      callback()
    }
  })
}

/**
 * Forbidden characters.
 * @type {Array}
 */

const forbidden = ['"', '.', "'"]

/**
 * Parse expression and replace
 * identifier.
 *
 * Examples:
 *
 *   parse('name + last');
 *   // => data.name + data.last
 *
 *   parse('name[0]');
 *   // => data.name[0]
 */

const parse = (str: string, arr: string[]) => {
  return str.replace(/\.\w+|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g, (expr) => {
    if (forbidden.indexOf(expr[0]) > -1) return expr
    if (!~arr.indexOf(expr)) arr.push(expr)
    return 'data.' + expr
  })
}

/**
 * Create a "thenable" object from a stream.
 * The object returned can be used with `await` keyword.
 */

const thenable = (stream: Stream) => {
  return {
    then: (resolve: (value: string) => void, reject: (reason: any) => void) => {
      let result = ''
      // TODO is there a way to merge pthenable and promisify?
      stream
        .on('data', (chunk) => result += chunk)
        .on('error', reject)
        .on('end', () => resolve(result))
    }
  }
}

/**
 * Resolve promise whenever a readable stream is done.
 * @param push function called on data
 */

const promisify = (
  stream: Readable, 
  push: (buff: Buffer) => void
) => {
   return new Promise((resolve, reject) => {
    stream
      .on('data', push)
      .on('error', reject)
      .on('end', resolve)
  })
}
