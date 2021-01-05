const { test } = require('@ianwalter/bff')
const dot = require('.')

test('simple get', t => {
  t.expect(dot.get({ key: { to: 'life' } }, 'key.to')).toBe('life')
})

test('get falsy parent', t => {
  t.expect(dot.get({ key: false }, 'key.to')).toBe(undefined)
})

test('fallback to default', t => {
  t.expect(dot.get({}, 'ok.so', 'what')).toBe('what')
})

test('simple set', t => {
  t.expect(dot.set({}, 'dre.skull', 1)).toEqual({ dre: { skull: 1 } })
})

test('simple delete', t => {
  t
    .expect(dot.del({ you: { know: false, dont: 'know' } }, 'you.dont'))
    .toEqual({ you: { know: false } })
})

test('delete from falsy source', t => {
  t.expect(dot.del(undefined, 'password')).toBe(undefined)
  t.expect(dot.del(null, 'password')).toBe(null)
  t.expect(dot.del(false, 'password')).toBe(false)
})

test('simple has', t => {
  t.expect(dot.has({ say: { a: 'prayer' } }, 'say.a')).toBe(true)
  t.expect(dot.has({ say: { a: 'prayer' } }, 'say.b')).toBe(false)
})

test('match', t => {
  t.expect(dot.match('1.2', '1.2')).toBe(true)
  t.expect(dot.match('1.2', '1.3')).toBe(false)
  t.expect(dot.match('1.2', '1.*')).toBe(true)
  t.expect(dot.match('1.*', '1.2')).toBe(true)
  t.expect(dot.match('1.*.3', '1.2.3')).toBe(true)
  t.expect(dot.match('1.3.4', '1.*.3')).toBe(false)
  t.expect(dot.match('1.2.3', '1.*.3')).toBe(true)
  t.expect(dot.match('1.2', '1.2.3')).toBe(false)
  t.expect(dot.match('1.2.3', '1.2')).toBe(false)
  t.expect(dot.match('1', '1.2')).toBe(false)
  t.expect(dot.match('1.2', '1')).toBe(false)
  t.expect(dot.match('1.*', '1.2.3')).toBe(true)
  t.expect(dot.match('1.2.3', '1.2.*')).toBe(true)
  t.expect(dot.match('1')).toBe(false)
  t.expect(dot.match(undefined, '1.2')).toBe(false)
})
