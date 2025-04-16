// import test from 'node:test'
// import assert from 'node:assert'
// import { mkdir, writeFile } from 'node:fs/promises'
// import { join } from 'node:path'
// import { rm } from 'node:fs/promises'
// import walk, { isRouteFile, isMiddlewareFile } from './walker'


// const extensions = ['ts', 'js', 'cjs', 'mjs', 'mts', 'cts', 'json', 'jsonp', 'csv', 'md', 'html']

// test('isRouteFile correctly identifies route files', async () => {
//   for (const ext of extensions) {
//     assert.strictEqual(isRouteFile(`route.${ext}`), true);
//     assert.strictEqual(isRouteFile(`route.post.${ext}`), true);
//     assert.strictEqual(isRouteFile(`agent.${ext}`), true);
//     assert.strictEqual(isRouteFile(`middleware.${ext}`), false);
//     assert.strictEqual(isRouteFile(`nonroute.${ext}`), false);
//   }
// });

// test('isMiddlewareFile correctly identifies middleware files', async () => {
//   for (const ext of extensions) {
//     assert.strictEqual(isMiddlewareFile(`middleware.${ext}`), true);
//     assert.strictEqual(isMiddlewareFile(`authorizer.${ext}`), true);
//     assert.strictEqual(isMiddlewareFile(`middleware.global.${ext}`), true);
//     assert.strictEqual(isMiddlewareFile(`route.${ext}`), false);
//     assert.strictEqual(isMiddlewareFile(`nonmiddleware.${ext}`), false);
//   }
// });

// test('walk yields the correct files', async () => {
//   const testDir = join(process.cwd(), 'test-walker-example');
//   try {
//     // Setup test directory
//     await mkdir(join(testDir, 'api', '(protected)', 'hello', 'world', 'john'), { recursive: true });
//     // Create route and middleware files
//     await writeFile(join(testDir, 'api', '(protected)', 'authorizer.ts'), '// Test authorizer');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'route.post.ts'), '// Test route.post');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'route.get.ts'), '// Test route.get');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'world', 'middleware.ts'), '// Test middleware');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'world', 'route.ts'), '// Test route');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'world', 'something.ts'), '// Test route.put');// Run walker
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'world', 'john', 'prompt.md'), '// Test route.put');
//     await writeFile(join(testDir, 'api', '(protected)', 'hello', 'world', 'john', 'index.ts'), '// Test route.put'); 
    
//     const results: string[][] = [];
    
//     for await (const filesToExecute of walk(testDir)) {
//       results.push(filesToExecute);
//     }
    
//     assert.deepStrictEqual(results, [
//       [
//         join(testDir, '/api/(protected)/authorizer.ts'),
//         join(testDir, '/api/(protected)/hello/route.get.ts')
//       ],
//       [
//         join(testDir, '/api/(protected)/authorizer.ts'),
//         join(testDir, '/api/(protected)/hello/route.post.ts')
//       ],
//       [
//         join(testDir, '/api/(protected)/authorizer.ts'),
//         join(testDir, '/api/(protected)/hello/world/middleware.ts'),
//         join(testDir, '/api/(protected)/hello/world/route.ts')
//       ],
//       [
//         join(testDir, '/api/(protected)/authorizer.ts'),
//         join(testDir, '/api/(protected)/hello/world/middleware.ts'),
//         join(testDir, '/api/(protected)/hello/world/john/prompt.md')
//       ]
//     ])
//   } finally {
//     // Clean up
//     await rm(testDir, { recursive: true, force: true });
//   }
// });
