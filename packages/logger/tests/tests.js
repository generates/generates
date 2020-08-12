const { test } = require('@ianwalter/bff')
const execa = require('execa')
const stripAnsi = require('strip-ansi')
const { createPrint } = require('..')

test('print', async t => {
  const env = { DEBUG: 'app.*', FORCE_COLOR: '2' }
  const { stdout } = await execa('pnpm', ['example', '-s'], { env })
  stdout.split('\n').forEach(line => {
    // Don't assert stacktrace lines.
    if (!stripAnsi(line).match(/ {4}at /)) {
      t.expect(line).toMatchSnapshot()
    }
  })
})

test('return', t => {
  const print = createPrint({ io: false })
  t.expect(print.info('Ello Guvna')).toMatchSnapshot()
})
