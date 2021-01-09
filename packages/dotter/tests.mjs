import { test } from '@ianwalter/bff'
import * as dotter from './dist/dotter.mjs'

test('simple get', t => {
  t.expect(dotter.get({ key: { to: 'life' } }, 'key.to')).toBe('life')
})

test('get falsy parent', t => {
  t.expect(dotter.get({ key: false }, 'key.to')).toBe(undefined)
})

test('fallback to default', t => {
  t.expect(dotter.get({}, 'ok.so', 'what')).toBe('what')
})

test('simple set', t => {
  t.expect(dotter.set({}, 'dre.skull', 1)).toEqual({ dre: { skull: 1 } })
})

test('simple delete', t => {
  t
    .expect(dotter.del({ you: { know: false, dont: 'know' } }, 'you.dont'))
    .toEqual({ you: { know: false } })
})

test('delete from falsy source', t => {
  t.expect(dotter.del(undefined, 'password')).toBe(undefined)
  t.expect(dotter.del(null, 'password')).toBe(null)
  t.expect(dotter.del(false, 'password')).toBe(false)
})

test('simple has', t => {
  t.expect(dotter.has({ say: { a: 'prayer' } }, 'say.a')).toBe(true)
  t.expect(dotter.has({ say: { a: 'prayer' } }, 'say.b')).toBe(false)
})

test('match', t => {
  t.expect(dotter.match('1.2', '1.2')).toBe(true)
  t.expect(dotter.match('1.2', '1.3')).toBe(false)
  t.expect(dotter.match('1.2', '1.*')).toBe(true)
  t.expect(dotter.match('1.2', '1.2.3')).toBe(true)
  t.expect(dotter.match('1.*', '1.2')).toBe(true)
  t.expect(dotter.match('1.*', '1.2.3')).toBe(true)
  t.expect(dotter.match('1.*', '1')).toBe(false)
  t.expect(dotter.match('1.*.3', '1.2.3')).toBe(true)
  t.expect(dotter.match('1.3.4', '1.*.3')).toBe(false)
  t.expect(dotter.match('1.2.3', '1.*.3')).toBe(true)
  t.expect(dotter.match('1.2.3', '1.2')).toBe(false)
  t.expect(dotter.match('1.2.3', '1.2.*')).toBe(true)
  t.expect(dotter.match('1', '1.2')).toBe(true)
  t.expect(dotter.match('1.2', '1')).toBe(false)
  t.expect(dotter.match('1')).toBe(false)
  t.expect(dotter.match(undefined, '1.2')).toBe(false)
})
