import { test } from '@ianwalter/bff'
import { excluding } from '../dist/extractor.mjs'

test('excluding a top-level property', t => {
  const o = excluding({ creamer: 'non-dairy', std: '1 in 4' }, 'std')
  t.expect(o).toEqual({ creamer: 'non-dairy' })
})

test('excluding a nested property', t => {
  const o = excluding({ one: { another: 'one', key: 'major' } }, 'one.another')
  t.expect(o).toEqual({ one: { key: 'major' } })
})

test('excluding multiple', t => {
  const source = { name: false, chain: { has: false, qty: 0 }, loc: 'hi' }
  const output = excluding(source, ...['loc', 'chain.has'])
  t.expect(output).toEqual({ name: false, chain: { qty: 0 } })
})

test('excluding falsy source', t => {
  t.expect(excluding(undefined, 'password')).toEqual(undefined)
  t.expect(excluding(null, 'phone')).toEqual(null)
  t.expect(excluding(false, 'address')).toEqual(false)
})
