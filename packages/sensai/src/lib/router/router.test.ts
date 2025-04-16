// Utils
import test from 'node:test'
import assert from 'node:assert'
import router from '@/src/lib/router'

test('should find static route', async () => {
  const { addRoute, lookup } = await router();
  addRoute('/api/route.get.ts')
  const { resource, middlewares, path, params } = lookup('/api')
  assert.equal(path, '/api')
  assert.deepEqual(params, {})
  const { route, type } = resource['GET'].default
  assert.equal(route, '/api/route.get.ts');
  assert.equal(type, 'route');
  assert.deepEqual(middlewares, []);
})

test('should find multiple static routes with same pathname', async () => {
  const { addRoute, lookup  } = await router();
  addRoute('/api/route.ts')
  addRoute('/api/route.post.ts')
  addRoute('/api/route.get.ts')
  for (const method of ['ANY','GET', 'POST']) {
    const { middlewares, resource, path, params } = lookup('/api')
    assert.equal(path, '/api')
    assert.deepEqual(params, {})
    const { route, type } = resource[method].default;
    assert.equal(route, `/api/route${method === 'ANY' ? '' : `.${method.toLowerCase()}`}.ts`);
    assert.equal(type, 'route');
    assert.deepEqual(middlewares, []);
  }
})

test('should find static route with middlewares', async () => {
  const { addRoute, addMiddleware, lookup } = await router();
  addRoute('/api/route.put.ts')
  addMiddleware('/api/authorizer.ts')
  const { resource, middlewares, path, params } = lookup('/api')

  assert.equal(path, '/api')
  assert.deepEqual(params, {})
  const { route, type } = resource['PUT'].default;
  assert.equal(route, '/api/route.put.ts');
  assert.equal(type, 'route');
  assert.deepEqual(middlewares, ['/api/authorizer.ts']);
})

test('should find static route with version', async () => {
  const { addRoute, lookup } = await router();
  addRoute('/api/route.get.ts')
  addRoute('/api/@v2/route.get.ts')
  addRoute('/api/@v3/route.ts')
  const versions = ['default', 'v2']
  for (const version of versions) {
    const { middlewares, resource, path, params } = lookup('/api')
    assert.equal(path, '/api')
    assert.deepEqual(params, {})
    const { route, type } = resource['GET'][version];
    assert.equal(route, `/api${version === 'default' ? '' : '/@v2'}/route.get.ts`);
    assert.equal(type, 'route');
    assert.deepEqual(middlewares, []);
  }
  const { middlewares, resource, path, params } = lookup('/api')
  assert.equal(path, '/api')
  assert.deepEqual(params, {})
  const { route, type } = resource['ANY']['v3'];
  assert.equal(route, `/api/@v3/route.ts`);
  assert.equal(type, 'route');
  assert.deepEqual(middlewares, []);
})

test('should return route path relative to a root directory', async () => {
  const { addRoute, lookup } = await router('/hello/world');
  addRoute('/api/route.get.ts')
  const { resource, middlewares, path, params } = lookup('/api')
  assert.equal(path, '/api')
  assert.deepEqual(params, {})
  const { route, type } = resource['GET'].default
  assert.equal(route, '/hello/world/api/route.get.ts');
  assert.equal(type, 'route');
  assert.deepEqual(middlewares, []);
})

test('should remove static route', async () => {
  const { addRoute, lookup, remove } = await router();
  addRoute('/api/route.get.ts')
  addRoute('/api/route.post.ts')
  addRoute('/api/hello/route.post.ts')
  assert.equal(remove('/api/route.get.ts'), true)
  const { resource } = lookup('/api')
  assert.equal(resource['GET'] == null, true)
  assert.equal(resource['POST'] != null, true)
  assert.equal(remove('/api/route.post.ts'), true)
  assert.equal(lookup('/api') == null, true)
  assert.equal(lookup('/api/hello') != null, true)
})

test('should remove parametric routes', async () => {
  const routes = [
    '/api/[name]/route.get.ts',
    '/api/[...names]/route.get.ts',
    '/api/[[...names]]/route.get.ts'
  ]
  for (const route of routes) {
    const { addRoute, lookup, remove } = await router();
    addRoute(route)
    assert.equal(remove(route), true)
    assert.equal(lookup('/api/olivier') == null, true)
  }

})

test('should delete folder of routes', async () => {
  const { addRoute, lookup, prune } = await router();
  addRoute('/api/hello/route.get.ts')
  addRoute('/api/hello/route.post.ts')
  addRoute('/api/hello/[name]/route.get.ts')

  assert.equal(lookup('/api/hello') != null, true)
  assert.equal(lookup('/api/hello/olivier') != null, true)
  assert.equal(prune('/api/hello'), true)
  assert.equal(lookup('/api/hello') == null, true)
  assert.equal(lookup('/api/hello/olivier') == null, true)
})