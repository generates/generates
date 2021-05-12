import { test } from '@ianwalter/bff'
import { including } from '../dist/extractor.mjs'

test('including top-level properties', t => {
  const source = { you: 'can', language: 'body', ok: true }
  const output = including(source, ...['you', 'ok'])
  t.expect(output).toEqual({ you: 'can', ok: true })
})

test('including nested properties', t => {
  const o = including(
    { let: { me: 'go', friend: 'best' }, one: { ok: true }, hoping: true },
    ...['let.me', 'one', 'doesntexist']
  )
  t.expect(o).toEqual({ let: { me: 'go' }, one: { ok: true } })
  t.expect('doesntexist' in o).toBe(false)
})
