import test from 'node:test'
import assert from 'node:assert'
import middlewares from './middlewares'
import { join, sep } from 'node:path'

test('should add and get middlewares', () => {
  const { add, get } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts')
  add(path1)
  const path2 = join(sep, 'api', 'hello', 'middleware.ts')
  add(path2)
  assert.deepEqual(get(join(sep, 'api', 'route.get.ts')), [path1])
  assert.deepEqual(get(join(sep, 'api', 'hello', 'route.post.ts')), [path1, path2])
})

test('should return middlewares in the correct order (parent to child)', () => {
  const { add, get } = middlewares()
  const paths = [
    join(sep, 'api', 'middleware.ts'),
    join(sep, 'api', 'hello', 'middleware.ts'),
    join(sep, 'api', 'hello', 'world', 'middleware.ts')
  ]
  paths.map(add)
  assert.deepStrictEqual(get(join(sep, 'api', 'hello', 'world', 'route.get.ts')), paths)
})

test('should remove middleware from the tree', () => {
  const { add, get, remove } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts') 
  add(path1)
  const path2 = join(sep, 'api', 'hello', 'middleware.ts') 
  add(path2)
  remove(path1)
  assert.deepStrictEqual(get(join(sep, 'api', 'hello', 'route.get.ts')), [path2])
})

test('should return empty array if no middlewares apply', () => {
  const { get } = middlewares()
  assert.deepStrictEqual(get(join(sep, 'api', 'hello', 'route.get.ts')), []);
});

test('should handle paths that do not exist in the folder structure', () => {
  const { add, get } = middlewares()
  const path = join(sep, 'api', 'middleware.ts');
  add(path);
  assert.deepStrictEqual( get(join(sep, 'api', 'nonexistent', 'route.get.ts')), [path]);
});

test('should handle middleware at deeply nested paths', () => {
  const { add, get } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts')
  const path2 = join(sep, 'api', 'deep', 'nested', 'path', 'middleware.ts')
  add(path1)
  add(path2)
  assert.deepStrictEqual(get(join(sep, 'api', 'deep', 'nested', 'path', 'route.get.ts')), [path1, path2])
});

test('should add multiple middlewares for the same path and sort them within a folder', () => {
  const { add, get } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts')
  const path2 = join(sep, 'api', 'authorizer.ts')
  add(path1)
  add(path2)
  const path3 = join(sep, 'api', 'hello', 'middleware.ts')
  add(path3)
  assert.deepEqual(get(join(sep, 'api', 'route.get.ts')), [path2, path1])
  assert.deepEqual(get(join(sep, 'api', 'hello', 'route.get.ts')), [path2, path1, path3])
})

test('should not add same middleware mutliple times', () => {
  const { add, get } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts')
  add(path1)
  add(path1)
  const path2 = join(sep, 'api', 'hello', 'middleware.ts')
  add(path2)
  assert.deepEqual(get(join(sep, 'api', 'route.get.ts')), [path1])
  assert.deepEqual(get(join(sep, 'api', 'hello', 'route.get.ts')), [path1, path2])
})

test('should remove middleware', () => {
  const { add, get, remove } = middlewares()
  const path1 = join(sep, 'api', 'middleware.ts')
  add(path1)
  const path2 = join(sep, 'api', 'hello', 'middleware.ts')
  add(path2)
  assert.deepEqual(get(join(sep, 'api', 'hello', 'route.post.ts')), [path1, path2])
  remove(path1)
  assert.deepEqual(get(join(sep, 'api', 'hello', 'route.post.ts')), [path2])

})