import { isRelative } from '@/src/utils/path'
import chokidar from 'chokidar'
import { join } from 'path'

/**
 * Initialize file-system watcher.
 * 
 * @notes 
 *   - reload modules on `update`
 *   - remove module from cache and router on `remove`
 *   - add module to cache and router on `add`
 *   - TODO node modules are not tracked (npm install will not reload cache)
 *   - TODO a failing module (bad dependency or anything else) should be removed from cache
 *   - TODO ignored folders (i.e node modules and .simpi) that get renamed are not added to cache/router
 */

export default async (dir: string, router: Router) => {
 // start tracking dependencies
 const { default: invalidate } = await import('@/src/utils/invalidate')
  // track dependencies only when needed
  const watcher = chokidar.watch(dir, {
    ignored: /(^|[\/\\])(node_modules|\.sensai)/,
    ignoreInitial: true
  })
  watcher.on('change', (filePath: string) => {
    console.log('invalidate cache', filePath)
    invalidate(join(process.cwd(), filePath))
  })
  watcher.on('add', (filePath: string) => {
    if (isRelative(dir, filePath)) {
      console.log('ADD file within api folder', filePath)
      router.add(join('/', filePath))
    }
  })
  watcher.on('unlink', (filePath: string) => {
    console.log('invalidate cache', filePath)
    invalidate(join(process.cwd(), filePath))
    if (isRelative(dir, filePath)) {
      console.log('REMOVE file within api folder', filePath)
      router.remove(join('/', filePath))
    }
  })
  // watcher.on('unlinkDir', (folderPath: string) => {
  //   console.log('unlinkDir')
  //   if (isRelative(dir, folderPath)) {
  //     router.prune(folderPath)
  //   }
  // })
}
