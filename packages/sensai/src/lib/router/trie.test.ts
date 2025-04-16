import test from 'node:test'
import assert from 'node:assert'
import trie from './trie'
// statis segment(s)
test('add static branches', () => {
  const { add, get } = trie()
  assert.equal(add('/hello/world'), true)
  assert.equal(get('/hello')?.end, false)
  assert.equal(get('/hello/world')?.end, true)
  assert.equal(add('/hello'), true)
  assert.equal(get('/hello')?.end, true)
})

test('add dynamic branches', () => {
  const { add, get } = trie()
  assert.equal(add('/hello/[country]/john'), true)
  assert.equal(get('/hello')?.end, false)
  assert.equal(get('/hello/[country]')?.end, false)
  assert.equal(get('/hello/world'), undefined)
  assert.equal(add('/hello/[country]'), true)
  assert.equal(get('/hello/[country]')?.end, true)
})

test('remove static branch', () => {
  const { add, get, remove } = trie()
  add('/hello')
  add('/hello/world')
  assert.equal(remove('/hello'), true)
  assert.equal(get('/hello/world')?.end, true)
  assert.equal(get('/hello')?.end, false)
  assert.equal(remove('/hello/john'), false)
})

test('lookup static branch', () => {
  const { add, lookup, remove } = trie()
  add('/')
  assert.deepEqual(lookup('/'), {
    path: '/',
    params: {}
  })
  add('/hello/world')
  assert.deepEqual(lookup('/hello/world'), {
    path: '/hello/world',
    params: {}
  })
  add('/hello')
  assert.deepEqual(lookup('/hello'), {
    path: '/hello',
    params: {}
  })
  remove('/hello/world')
  assert.equal(lookup('/hello/world'), undefined)
})

// parametic segment(s)
test('lookup branch with parametric segment', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[country]')
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[country]',
    params: {
      country: 'canada'
    }
  })
  remove('/hello/[country]')
  assert.equal(lookup('/hello/canada'), undefined)
  if (lookup('/hello/world/france/canada')) assert.fail('/hello/world/france/canada lookup should be undefined')
})

test('lookup branch with multiple parametric segments', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[country]')
  add('/hello/[country]/ontario')
  add('/hello/[country]/ontario/[city]')
  add('/hello/[country]/[province]')
  const provinces = () => {
    assert.deepEqual(lookup('/hello/canada/ontario'), {
      path: '/hello/[country]/ontario',
      params: {
        country: 'canada'
      }
    })
    assert.deepEqual(lookup('/hello/canada/alberta'), {
      path: '/hello/[country]/[province]',
      params: {
        country: 'canada',
        province: 'alberta'
      }
    })
  }
  const city = () => {
    assert.deepEqual(lookup('/hello/canada/ontario/toronto'), {
      path: '/hello/[country]/ontario/[city]',
      params: {
        country: 'canada',
        city: 'toronto'
      }
    })
  }
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[country]',
    params: {
      country: 'canada'
    }
  })
  provinces()
  city()

  remove('/hello/[country]')
  assert.equal(lookup('/hello/canada'), undefined)
  provinces()
  city()

  remove('/hello/[country]/[province]')
  assert.deepEqual(lookup('/hello/canada/ontario'), {
    path: '/hello/[country]/ontario',
    params: {
      country: 'canada'
    }
  })
  assert.equal(lookup('/hello/canada/alberta'), undefined)
  city()

  remove('/hello/[country]/ontario/[city]')
  assert.equal(lookup('/hello/canada/ontario/guelph'), undefined)
})

// force remove
test('delete all subsequent branches', () => {
  const { add, get, remove } = trie()
  add('/hello/world')
  add('/hello/world/[country]')
  add('/hello')
  add('/hello/john')
  assert.equal(remove('/hello', true), true)
  assert.equal(get('/hello/world'), undefined)
  assert.equal(get('/hello/world/[country]'), undefined)
  assert.equal(get('/hello/world/john'), undefined)
})

// catch-all segment(s)
test('lookup branch with catch-all segment', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[...names]')
  assert.deepEqual(lookup('/hello/john'), {
    path: '/hello/[...names]',
    params: {
      names: ['john']
    }
  })
  assert.deepEqual(lookup('/hello/john/jane'), {
    path: '/hello/[...names]',
    params: {
      names: ['john', 'jane']
    }
  })
  remove('/hello/[...names]')
  assert.equal(lookup('/hello/john'), undefined)
  assert.equal(lookup('/hello/jane'), undefined)
})

test('should not lookup segments after catch-all', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[...countries]')
  add('/hello/[...countries]/ontario/[...cities]')
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[...countries]',
    params: { countries: ['canada'] }
  })
  assert.deepEqual(lookup('/hello/canada/france'), {
    path: '/hello/[...countries]',
    params: { countries: ['canada', 'france'] }
  })
  assert.deepEqual(lookup('/hello/canada/ontario/toronto'), {
    path: '/hello/[...countries]',
    params: { countries: ['canada', 'ontario', 'toronto'] }
  })
  remove('/hello/[...countries]')
  assert.equal(lookup('/hello/canada'), undefined)
  assert.equal(lookup('/hello/canada/france'), undefined)
  assert.equal(lookup('/hello/canada/ontario/toronto'), undefined)
})

test('lookup branch with parametric and catch all segments', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[country]')
  add('/hello/[country]/ontario/[...cities]')
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[country]',
    params: { country: 'canada' }
  })
  assert.equal(lookup('/hello/canada/ontario'), undefined)
  assert.deepEqual(lookup('/hello/canada/ontario/toronto/guelph'), {
    path: '/hello/[country]/ontario/[...cities]',
    params: { country: 'canada', cities: ['toronto', 'guelph'] }
  })
  remove('/hello/[country]')
  assert.equal(lookup('/hello/canada'), undefined)
  assert.deepEqual(lookup('/hello/canada/ontario/toronto/guelph'), {
    path: '/hello/[country]/ontario/[...cities]',
    params: { country: 'canada', cities: ['toronto', 'guelph'] }
  })
  remove('/hello/[country]/ontario/[...cities]')
  assert.equal(lookup('/hello/canada/ontario/toronto/guelph'), undefined)
  add('/hello/[...countries]/[city]')
  assert.equal(lookup('/hello/canada/france/paris'), undefined)
  add('/hello/[...countries]')
  assert.deepEqual(lookup('/hello/canada/france/paris'), undefined) // the folder [country] still exists
  remove('/hello/[country]', true)
  assert.deepEqual(lookup('/hello/canada/france/paris'), {
    path: '/hello/[...countries]',
    params: { countries: ['canada', 'france', 'paris']}
  })
})

// optional catch-all segment(s)
test('lookup branch with optional catch-all segment', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[[...names]]')
  assert.deepEqual(lookup('/hello/john'), {
    path: '/hello/[[...names]]',
    params: {
      names: ['john']
    }
  })
  assert.deepEqual(lookup('/hello/john/jane'), {
    path: '/hello/[[...names]]',
    params: {
      names: ['john', 'jane']
    }
  })
  assert.deepEqual(lookup('/hello'), {
    path: '/hello/[[...names]]',
    params: {
      names: []
    }
  })
  add('/hello')
  assert.deepEqual(lookup('/hello'), {
    path: '/hello',
    params: {}
  })
  remove('/hello/[[...names]]')
  assert.equal(lookup('/hello/john'), undefined)
  assert.equal(lookup('/hello/jane'), undefined)
})

test('should not lookup segments after optional catch-all', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[[...countries]]')
  add('/hello/[[...countries]]/ontario/[...cities]')
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[[...countries]]',
    params: { countries: ['canada'] }
  })
  assert.deepEqual(lookup('/hello/canada/france'), {
    path: '/hello/[[...countries]]',
    params: { countries: ['canada', 'france'] }
  })
  assert.deepEqual(lookup('/hello/canada/ontario/toronto'), {
    path: '/hello/[[...countries]]',
    params: { countries: ['canada', 'ontario', 'toronto'] }
  })
  remove('/hello/[[...countries]]')
  assert.equal(lookup('/hello'), undefined)
  assert.equal(lookup('/hello/canada'), undefined)
  assert.equal(lookup('/hello/canada/france'), undefined)
  assert.equal(lookup('/hello/canada/ontario/toronto'), undefined)
  add('/hello/[[...countries]]')
  assert.deepEqual(lookup('/hello/canada/france'), {
    path: '/hello/[[...countries]]',
    params: { countries: ['canada', 'france'] }
  })
})

test('lookup branch with parametric and optional catch all segments', () => {
  const { add, lookup, remove } = trie()
  add('/hello/[country]')
  add('/hello/[country]/ontario/[[...cities]]')
  assert.deepEqual(lookup('/hello/canada'), {
    path: '/hello/[country]',
    params: { country: 'canada' }
  })
  assert.deepEqual(lookup('/hello/canada/ontario'), {
    path: '/hello/[country]/ontario/[[...cities]]',
    params: { country: 'canada', cities: [] }
  })
  assert.deepEqual(lookup('/hello/canada/ontario/toronto/guelph'), {
    path: '/hello/[country]/ontario/[[...cities]]',
    params: { country: 'canada', cities: ['toronto', 'guelph'] }
  })
  remove('/hello/[country]')
  assert.equal(lookup('/hello/canada'), undefined)
  assert.deepEqual(lookup('/hello/canada/ontario/toronto/guelph'), {
    path: '/hello/[country]/ontario/[[...cities]]',
    params: { country: 'canada', cities: ['toronto', 'guelph'] }
  })
  remove('/hello/[country]/ontario/[[...cities]]')
  assert.equal(lookup('/hello/canada/ontario/toronto/guelph'), undefined)
  add('/hello/[...countries]/[city]')
  assert.equal(lookup('/hello/canada/france/paris'), undefined)
  add('/hello/[...countries]')
  assert.deepEqual(lookup('/hello/canada/france/paris'), undefined) // the folder [country] still exists
  remove('/hello/[country]', true)
  assert.deepEqual(lookup('/hello/canada/france/paris'), {
    path: '/hello/[...countries]',
    params: { countries: ['canada', 'france', 'paris']}
  })
})

test('returns params correctly for "dirty" paths', () => {
  const { add, lookup } = trie()
  add('/[country]')
  assert.deepEqual(lookup('///france//'), {
    path: '/[country]',
    params: { country: 'france' }
  })
  add('/[country]/[...cities]')
  assert.deepEqual(lookup('///france//paris///nice///'), {
    path: '/[country]/[...cities]',
    params: { country: 'france', cities: ['paris', 'nice'] }
  })
})

test('should remove static route and replace with parametric route', () => {
  const { add, lookup, remove } = trie()
  add('/hello/france') 
  assert.deepStrictEqual(lookup('/hello/france'), {
    path: '/hello/france',
    params: {}
  })
  remove('/hello/france')
  add('/hello/[name]')
  assert.deepStrictEqual(lookup('/hello/france'), {
    path: '/hello/[name]',
    params: { name: 'france' }
  })
})