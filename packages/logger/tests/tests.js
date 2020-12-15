import { test } from '@ianwalter/bff'
import execa from 'execa'
import stripAnsi from 'strip-ansi'
import { createLogger } from '../index.js'

test('logger', async t => {
  const env = { DEBUG: 'app.*', FORCE_COLOR: '2' }
  const { stdout } = await execa('npm', ['run', 'example', '-s'], { env })
  stdout.split('\n').forEach(line => {
    // Don't assert stacktrace lines.
    if (!stripAnsi(line).match(/ {4}at /)) {
      t.expect(line).toMatchSnapshot()
    }
  })
})

test('return', t => {
  const logger = createLogger({ io: false })
  t.expect(logger.info('Ello Guvna')).toMatchSnapshot()
})
