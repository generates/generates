import { test } from '@ianwalter/bff'
import execa from 'execa'
import { createLogger } from '../index.js'

test('logger', async t => {
  const env = { DEBUG: 'app.*', FORCE_COLOR: '2' }
  const { stdout } = await execa('node', ['tests/fixtures/example.js'], { env })
  await t.logger.log('Example', stdout)
  t.expect(stdout).toMatchSnapshot()
})

test('return', t => {
  const logger = createLogger({ io: false })
  t.expect(logger.info('Ello Guvna')).toMatchSnapshot()
})

test('async', async t => {
  const logger = createLogger()
  t.expect(await logger.warn('I heard a sound')).toMatchSnapshot()
})
