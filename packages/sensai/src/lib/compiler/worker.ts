// utils
import { dirname, join, parse, relative } from 'node:path'
import { transform } from '@swc/core'
//import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, readFile, writeFile, symlink } from 'node:fs/promises'
import options, { getCompilerOptions } from '@/src/lib/compiler/options'
import { getPromptTypescript, getMarkdownTypescript } from '@/src/lib/compiler/markdown'

// the working directory
const CWD_PATH = process.cwd()

/**
 * Compile Javascript file and write it to the destination directory. 
 */

export const javascript = async (filePath: string, outPath: string) => {
  const content = await readFile(filePath, 'utf-8')
  const code = await getJsCode(filePath, content)
  await write(filePath, outPath, code)
}

/**
 * Compile route file and write it to the destination directory.
 * @notes we should do some further processing (i.e security, validation, etc).
 */

export const route = async (filePath: string, outPath: string) => {
  await javascript(filePath, outPath)
}

/**
 * Compile prompt markdown and write it to the destination directory.
 */

export const prompt = async (filePath: string, outPath: string) => {
  // TODO we should copy the original file and create a ts file 
  // may be with a unique name (may be based on hash of fileName).
  const file = await readFile(filePath, 'utf-8')
  const content = getPromptTypescript(file)
  const { dir, name } = parse(filePath)
  const code = await getJsCode(join(dir, name + '.ts'), content)
  await write(filePath, outPath, code)
}

export const markdown =  async (filePath: string, outPath: string) => {
  const file = await readFile(filePath)
  const content = getMarkdownTypescript(file, false)
  const { dir, name } = parse(filePath)
  const code = await getJsCode(join(dir, name + '.ts'), content)
  await write(filePath, outPath, code)
}

/**
 * Files that don't need compilation are copied to the destination directory.
 */

export const unknown =  async (filePath: string, outPath: string) => {
  await copy(filePath, outPath)
}

/**
 * Generate JavaScript off Typescript content.
 * @param filePath used to get the right compiler options
 */

const getJsCode = async (filePath: string, content: string) => {
  const aliases = getCompilerOptions(CWD_PATH)
  const { code } = await transform(content, options(filePath, aliases))
  return code
}

/**
 * Write content to the destination directory given the file name (computed from the
 * file path and destination directory).
 */

const write = async (
  filePath: string, 
  destPath: string, 
  content: string
) => {
  const path = join(destPath, relative(CWD_PATH, filePath))
  await mkdir(dirname(path), { recursive: true })
  return writeFile(path, content)
}

/**
 * Copy file to the destination directory given the file name (computed from the
 * file path and destination directory).
 * 
 * @notes we might want to use symlinks for further optimization.
 */

const copy = async (filePath: string, destPath: string) => {
  // const path = join(destPath, relative(CWD_PATH, filePath))
  // const writeStream = createWriteStream(path)
  // createReadStream(filePath).pipe(writeStream)
  // return new Promise((resolve, reject) => {
  //   writeStream.on('finish', resolve)
  //   writeStream.on('error', reject)
  // })
  const path = join(destPath, relative(CWD_PATH, filePath))
  await mkdir(dirname(path), { recursive: true })
  await symlink(filePath, path)
};