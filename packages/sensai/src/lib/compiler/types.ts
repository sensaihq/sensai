// Types 
import type { JscConfig } from '@swc/core'

// typescript compiler options
export type CompilerOptionsT = Pick<JscConfig, 'baseUrl' | 'paths'>

export type BundleOptionsT = {
  copyFiles: boolean
  cwdPath: string 
  destPath: string
  srcPath?: string
}