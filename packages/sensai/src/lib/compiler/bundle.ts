import { readApiDir } from 'lib/utils'
import options, { getCompilerOptions } from '@/src/lib/compiler/options'
import { 
  mkdir, 
  readFile, 
  writeFile 
} from 'node:fs/promises'
import { 
  dirname,
  join, 
  parse as parsePath,
  relative 
} from 'node:path'
import { Readable, Transform } from 'node:stream'
import { transform} from '@swc/core'
import type { BundleOptionsT, CompilerOptionsT } from '@/src/lib/compiler/types'


/**
 * Bundle (i.e compile, optimize) source directory into destination directory.
 * 
 * @param options.cwdPath working directory
 * @param options.destPath destination directory
 * @param options.srcPath source directory
 * @param options.copyFiles copy all files in srcPath if `true`
 * 
 * @notes
 * 
 *   - TODO we should look at bundling routes if possible 
 *   - TODO compile routes config
 */

export default async (
  cb: (filePath: string) => void,
  options: BundleOptionsT
): Promise<void> => {
  const stream = bundle(options)
  return new Promise((resolve, reject) => {
    stream.on('data', cb)
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}
  
/**
 * Read all files in a directory and transform files with supported 
 * extensions, copy otherwise.
 * This method is a pass through and only push transformed files down the pipe.
 */

const bundle = (options: BundleOptionsT): Readable => {
  const { cwdPath, srcPath = cwdPath } = options
  const compilerOptions = getCompilerOptions(cwdPath)
  return readApiDir(srcPath, {
    // TODO we should load all ignore from .gitignore 
    // on top of node modules and sensai
    // TODO git ls-tree --full-tree --name-only -r HEAD # list all files in git
    ignore: ['node_modules', '.sensai']
  }).pipe(new Transform({
    objectMode: true,
    async transform(buffer: Buffer, _encoding, callback) {
      const path = await write(buffer.toString(), { ...options, compilerOptions })
      callback(null, path)
    }
  }))
}
  
/**
 * This method will check if a given file has an extension supported by our compiler 
 * and will transform the file if that's the case. The transformed file is then 
 * copied over `options.destPath` as a `cjs` file.
 */

const write = async (
  filePath: string,
  opts: BundleOptionsT & { compilerOptions: CompilerOptionsT }
): Promise<string | undefined> => {
  const { compilerOptions, copyFiles, cwdPath, destPath } = opts
  const config = options(filePath, compilerOptions)
  if (config) {
    const { dir, ext, name } = parsePath(filePath)
    const path = join(destPath, relative(cwdPath, join(dir, name + ext)))
    await copyTransformFile(filePath, path, async (content) => {
      const { code } = await transform(content, config)
      // TODO generate maps
      return code
    })
    return path
  } else if (copyFiles) {
    const path = join(destPath, relative(cwdPath, filePath))
    await copyTransformFile(filePath, path)
    return path
  }
}
  
/**
 * This method is used to copy one file from one location to an other and apply 
 * a transformation if specified.
 * This method is used in production mode.
 * @private
 */

const copyTransformFile = async (
  filePath: string,
  destPath: string,
  transform: ((content: string) => string | Promise<string>) = (content: string) => content
): Promise<void> => {
  const file = await readFile(filePath)
  await mkdir(dirname(destPath), { recursive: true }) // TODO should we check if we have access?
  const content = await transform(file.toString())
  await writeFile(destPath, content)
}