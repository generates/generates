import { test } from '@ianwalter/bff'
import execa from 'execa'
// import stripAnsi from 'strip-ansi'
import { createLogger } from '../index.js'

// Don't assert stacktrace file path lines.
const outPath = line => !line.includes('file:') && !line.includes('internal/')

test('logger', async t => {
  const env = { DEBUG: 'app.*', FORCE_COLOR: '2' }
  const { stdout } = await execa('yarn', ['-s', 'example'], { env })
  await t.logger.log('Example', stdout)
  t.expect(stdout.split('\n').filter(outPath).join('\n')).toMatchSnapshot()
})

test('return', t => {
  const logger = createLogger({ io: false })
  t.expect(logger.info('Ello Guvna')).toMatchSnapshot()
})

test('async', async t => {
  const logger = createLogger()
  t.expect(await logger.warn('I heard a sound')).toMatchSnapshot()
})
