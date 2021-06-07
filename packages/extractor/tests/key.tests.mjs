import { test } from '@ianwalter/bff'
import { key } from '../dist/extractor.mjs'

test('key', t => {
  t.expect(key({ language: 'body', ok: true }, 'body')).toBe('language')
})
