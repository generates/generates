import { test } from '@ianwalter/bff'
import execa from 'execa'
import exampleCli from './fixtures/exampleCli.js'

test('cli', async t => {
  const { stdout } = await execa('./tests/fixtures/exampleCli.js', ['-c', '4'])
  t.expect(stdout).toMatchSnapshot()
})

test('dot format', async t => {
  const args = ['--some.other.thing', 'b']
  const { stdout } = await execa('./tests/fixtures/exampleCli.js', args)
  t.expect(stdout).toMatchSnapshot()
})

test('default', async t => {
  t.expect(exampleCli.path).toBe('/some/path')
})

test('command', async t => {
  const args = ['dock', '--port', 'Havensight']
  const { stdout } = await execa('./tests/fixtures/battleshipCli.js', ['dock'])
  t.expect(stdout).toContain('Docked at Havensight!')
})
