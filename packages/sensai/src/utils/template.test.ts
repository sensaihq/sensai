import test from 'node:test'
import assert from 'node:assert'
import { Readable, Writable } from 'node:stream'
import template from './template'

test('Basic string template', async (t) => {
  const render = template('Hello #{name}!')
  const result = await render({ name: 'World' })
  assert.strictEqual(result, 'Hello World!')
})

test('Template literal syntax', async (t) => {
  const name = 'World'
  const tmpl = template`Hello ${name}!`
  const result = await tmpl
  assert.strictEqual(result, 'Hello World!')
})

test('Multiple placeholders', async (t) => {
  const render = template('Hello #{firstName} #{lastName}!')
  const result = await render({ firstName: 'John', lastName: 'Doe' })
  assert.strictEqual(result, 'Hello John Doe!')
})

test('Expression evaluation', async (t) => {
  const render = template('The answer is #{a + b}!')
  const result = await render({ a: 20, b: 22 })
  assert.strictEqual(result, 'The answer is 42!')
})

test('Using array index', async (t) => {
  const render = template('First item: #{items[0]}')
  const result = await render({ items: ['apple', 'banana', 'cherry'] })
  assert.strictEqual(result, 'First item: apple')
})

test('Nested properties', async (t) => {
  const render = template('Welcome, #{user.profile.name}!')
  const result = await render({ 
    user: { 
      profile: { 
        name: 'Alice' 
      } 
    } 
  })
  assert.strictEqual(result, 'Welcome, Alice!')
})

test('Function execution', async (t) => {
  const render = template('Calculated: #{calculate()}')
  const result = await render({ 
    calculate: () => 100 * 2
  })
  assert.strictEqual(result, 'Calculated: 200')
})

test('Missing data should render empty string', async (t) => {
  const render = template('Value: #{missing}!')
  const result = await render({})
  assert.strictEqual(result, 'Value: !')
})

test('Streaming capability - pipe to another stream', async (t) => {
  const render = template('Hello #{name}!')
  const stream = render({ name: 'Stream' })
  
  // Create a writable stream to collect data
  let collected = ''
  const writable = new Writable({
    write(chunk, encoding, callback) {
      collected += chunk.toString()
      callback()
    }
  })
  
  // Pipe and wait for completion
  stream.pipe(writable)
  await new Promise(resolve => stream.on('end', resolve))
  
  assert.strictEqual(collected, 'Hello Stream!')
})

test('Stream as a placeholder value', async (t) => {
  const render = template('Content: #{content}')
  
  const contentStream = new Readable({
    read() {
      this.push('streamed content')
      this.push(null)
    }
  })
  
  const result = await render({ content: contentStream })
  assert.strictEqual(result, 'Content: streamed content')
})

test('Promise as a placeholder value', async (t) => {
  const render = template('Async value: #{asyncValue}')
  const result = await render({ 
    asyncValue: Promise.resolve('resolved')
  })
  assert.strictEqual(result, 'Async value: resolved')
})

test('Numbers, booleans, and null values', async (t) => {
  const render = template('Number: #{num}, Boolean: #{bool}, Null: #{nil}')
  const result = await render({ 
    num: 42, 
    bool: true, 
    nil: null 
  })
  assert.strictEqual(result, 'Number: 42, Boolean: true, Null: ')
})

test('Complex expressions', async (t) => {
  const render = template('Result: #{a * 2 + (b > 10 ? 100 : 0)}')
  
  await t.test('Branch one', async () => {
    const result = await render({ a: 5, b: 15 })
    assert.strictEqual(result, 'Result: 110')
  })
  
  await t.test('Branch two', async () => {
    const result = await render({ a: 5, b: 5 })
    assert.strictEqual(result, 'Result: 10')
  })
})

test('Template with no placeholders', async (t) => {
  const render = template('Static content')
  const result = await render()
  assert.strictEqual(result, 'Static content')
})

// TODO should we trigger error or comsider a?.missing?.property?
// test('Error in expression evaluation', async (t) => {
//   const render = template('Bad: #{a.missing.property}')
//   await assert.rejects(async () => {
//     await render({ a: {} })
//   }, {
//     name: 'TypeError'
//   })
// })

test('Using string literals in expressions', async (t) => {
  const render = template('With quotes: #{name + " " + "quoted"}')
  const result = await render({ name: 'String' })
  assert.strictEqual(result, 'With quotes: String quoted')
})

test('Object method invocation in template', async (t) => {
  const render = template('Uppercase: #{name.toUpperCase()}')
  const result = await render({ name: 'convert' })
  assert.strictEqual(result, 'Uppercase: CONVERT')
})

test('Multiple template renderings with same engine', async (t) => {
  const render = template('Hello #{name}!')
  
  const result1 = await render({ name: 'First' })
  assert.strictEqual(result1, 'Hello First!')
  
  const result2 = await render({ name: 'Second' })
  assert.strictEqual(result2, 'Hello Second!')
})

test('Empty template string', async (t) => {
  const render = template('')
  const result = await render()
  assert.strictEqual(result, '')
})

// TODO this should work
// test('Sequential placeholders', async (t) => {
//   const render = template('#{a}#{b}#{c}')
//   const result = await render({ a: 'Hello', b: ' ', c: 'World' })
//   assert.strictEqual(result, 'Hello World')
// })

test('Function returning another stream as placeholder', async (t) => {
  const render = template('Content: #{getContent()}')
  
  const result = await render({ 
    getContent: () => {
      return new Readable({
        read() {
          this.push('nested stream')
          this.push(null)
        }
      })
    }
  })
  
  assert.strictEqual(result, 'Content: nested stream')
})

// TODO this should work
// test('Math expressions', async (t) => {
//   const render = template('Math: #{Math.floor(3.14159)}')
//   const result = await render({})
//   assert.strictEqual(result, 'Math: 3')
// })

test('Data object is optional', async (t) => {
  const render = template('Static #{1 + 1}')
  const result = await render() // No data object passed
  assert.strictEqual(result, 'Static 2')
})


// test('Advanced stream handling', async (t) => {
//     await t.test('Nested streams', async () => {
//       const render = template('Nested: #{outer}')
      
//       const innerStream = new Readable({
//         read() {
//           this.push('inner content')
//           this.push(null)
//         }
//       })
      
//       const outerStream = new Readable({
//         read() {
//           this.push('begin-')
//           this.push(innerStream)
//           this.push('-end')
//           this.push(null)
//         }
//       })
      
//       // This test will fail unless the template engine properly handles
//       // stream objects within streams, which isn't typical behavior
//       try {
//         const result = await render({ outer: outerStream })
//         console.log('RESULT', result)
//         assert.strictEqual(result, 'Nested: begin-inner content-end')
//       } catch (err) {
//         // Alternatively, check that it fails predictably
//         assert.strictEqual(err.code, 'ERR_INVALID_ARG_TYPE')
//       }
//     })
    
//     await t.test('Transform stream as placeholder', async () => {
//       const render = template('Transformed: #{transformer}')
      
//       const transformer = new Transform({
//         transform(chunk, encoding, callback) {
//           this.push(chunk.toString().toUpperCase())
//           callback()
//         }
//       })
      
//       // Write to the transform stream after setting it as a placeholder
//       setTimeout(() => {
//         transformer.write('lowercase')
//         transformer.end()
//       }, 10)
      
//       const result = await render({ transformer })
//       assert.strictEqual(result, 'Transformed: LOWERCASE')
//     })
//   })
  
  // test('Error handling', async (t) => {
  //   await t.test('Function throwing error', async () => {
  //     const render = template('Error: #{throwError()}')
      
  //     await assert.rejects(async () => {
  //       await render({ 
  //         throwError: () => { throw new Error('Test error') }
  //       })
  //     }, {
  //       message: 'Test error'
  //     })
  //   })
    
  //   await t.test('Stream emitting error', async () => {
  //     const render = template('Stream error: #{errorStream}')
      
  //     const errorStream = new Readable({
  //       read() {
  //         this.emit('error', new Error('Stream error'))
  //       }
  //     })
      
  //     await assert.rejects(async () => {
  //       await render({ errorStream })
  //     }, {
  //       message: 'Stream error'
  //     })
  //   })
    
  //   await t.test('Promise rejection', async () => {
  //     const render = template('Promise rejection: #{failingPromise}')
      
  //     await assert.rejects(async () => {
  //       await render({ 
  //         failingPromise: Promise.reject(new Error('Promise failed'))
  //       })
  //     }, {
  //       message: 'Promise failed'
  //     })
  //   })
  // })
  
  // test('Edge cases', async (t) => {
  //   await t.test('Extremely large template', async () => {
  //     // Create a large template with many placeholders
  //     const placeholders = 1000
  //     let largeTemplate = ''
  //     let expectedResult = ''
      
  //     for (let i = 0; i < placeholders; i++) {
  //       largeTemplate += `#{n${i}}`
  //       expectedResult += i.toString()
  //     }
      
  //     // Create data object with all placeholders
  //     const data = {}
  //     for (let i = 0; i < placeholders; i++) {
  //       data[`n${i}`] = i
  //     }
      
  //     const render = template(largeTemplate)
  //     const result = await render(data)
  //     assert.strictEqual(result, expectedResult)
  //   })
    
  //   await t.test('Circular references in data', async () => {
  //     const render = template('Value: #{obj.value}')
      
  //     const data = { obj: { value: 'test' } }
  //     // Create circular reference
  //     data.obj.self = data.obj
      
  //     const result = await render(data)
  //     assert.strictEqual(result, 'Value: test')
  //   })
    
  //   await t.test('Unicode characters', async () => {
  //     const render = template('Unicode: #{text}')
      
  //     const result = await render({ 
  //       text: '你好 👋 こんにちは'
  //     })
      
  //     assert.strictEqual(result, 'Unicode: 你好 👋 こんにちは')
  //   })
    
  //   await t.test('Escaping placeholders', async () => {
  //     // The engine doesn't have native support for escaping.
  //     // This test documents expected behavior.
  //     const render = template('Literal #{: #{value}')
      
  //     const result = await render({ value: 'test' })
  //     // Current behavior would try to evaluate '{: #{value' as an expression
  //     // This might error or produce unexpected results
  //     try {
  //       assert.ok(result.includes('test') || result.includes('error'))
  //     } catch (err) {
  //       // Expected to potentially fail
  //       assert.ok(err)
  //     }
  //   })
  // })
  
  // test('Performance benchmark', async (t) => {
  //   const render = template('#{value}')
    
  //   // Measure time for 1000 renderings
  //   const start = performance.now()
  //   for (let i = 0; i < 1000; i++) {
  //     await render({ value: 'test' })
  //   }
  //   const duration = performance.now() - start
    
  //   // This is not a strict test, just informational
  //   console.log(`Performed 1000 renderings in ${duration}ms (${duration/1000}ms per render)`)
  //   assert.ok(true) // Just to have an assertion
  // })
  
  // test('Template literal placeholder injection', async (t) => {
  //   await t.test('Template literals with expressions', async () => {
  //     const x = 10
  //     const y = 5
  //     const tmpl = template`Sum: ${x + y}, Product: ${x * y}`
  //     const result = await tmpl
  //     assert.strictEqual(result, 'Sum: 15, Product: 50')
  //   })
    
  //   await t.test('Template literals with functions', async () => {
  //     const getGreeting = () => 'Hello'
  //     const getName = () => 'Template'
      
  //     const tmpl = template`${getGreeting()} ${getName()}!`
  //     const result = await tmpl
  //     assert.strictEqual(result, 'Hello Template!')
  //   })
    
  //   await t.test('Template literals with nested templates', async () => {
  //     const innerTemplate = template`inner`
  //     const outerTemplate = template`outer ${await innerTemplate}`
      
  //     const result = await outerTemplate
  //     assert.strictEqual(result, 'outer inner')
  //   })
  // })
  
  // test('Parse function tests', async (t) => {
  //   // These tests are intended to verify the behavior of the internal parse function
    
  //   await t.test('Parsing dot notation', async () => {
  //     const render = template('Test: #{a.b.c}')
  //     const result = await render({ a: { b: { c: 'nested' } } })
  //     assert.strictEqual(result, 'Test: nested')
  //   })
    
  //   await t.test('Parsing array access', async () => {
  //     const render = template('Test: #{arr[0][1]}')
  //     const result = await render({ arr: [['a', 'b'], ['c', 'd']] })
  //     assert.strictEqual(result, 'Test: b')
  //   })
    
  //   await t.test('Parsing string literals', async () => {
  //     const render = template('Test: #{"static string"}')
  //     const result = await render({})
  //     assert.strictEqual(result, 'Test: static string')
  //   })
    
  //   await t.test('Parsing with regex', async () => {
  //     // Current implementation doesn't handle regex patterns in expressions
  //     // This test documents expected behavior
  //     const render = template('Test: #{/test/.test(value)}')
      
  //     try {
  //       const result = await render({ value: 'test' })
  //       assert.strictEqual(result, 'Test: true')
  //     } catch (err) {
  //       // If it fails, that's the current implementation limitation
  //       assert.ok(err)
  //     }
  //   })
  // })
  
  // test('Using the template engine in different ways', async (t) => {
  //   await t.test('Streaming to file', async () => {
  //     const render = template('File content with #{value}')
  //     const stream = render({ value: 'data' })
      
  //     // Simulate writing to file with a proper Writable stream
  //     let fileContent = ''
  //     const { Writable } = await import('node:stream')
  //     const fileStream = new Writable({
  //       write(chunk, encoding, callback) {
  //         fileContent += chunk.toString()
  //         callback()
  //       }
  //     })
      
  //     stream.pipe(fileStream)
  //     await new Promise(resolve => stream.on('end', resolve))
      
  //     assert.strictEqual(fileContent, 'File content with data')
  //   })
    
  //   await t.test('Async iteration of template result', async () => {
  //     const render = template('Before #{middle} after')
  //     const stream = render({ middle: 'content' })
      
  //     let result = ''
  //     for await (const chunk of stream) {
  //       result += chunk
  //     }
      
  //     assert.strictEqual(result, 'Before content after')
  //   })
  // })
  