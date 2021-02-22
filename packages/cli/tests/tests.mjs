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
  let args = ['save', '--path', './test.mp3']
  let result = await execa('./tests/fixtures/musicCli.js', args)
  t.expect(result.stdout).toContain('Music saved to:', args[2])

  result = await execa('./tests/fixtures/musicCli.js', ['start', 'drum'])
  t.expect(result.stdout).toContain('No tempo specified')

  args = ['start', 'drum', '120']
  result = await execa('./tests/fixtures/musicCli.js', args)
  t.expect(result.stdout).toContain('Playing the drum at', args[2])

  result = await execa('./tests/fixtures/musicCli.js', ['start', 'guitar'])
  t.expect(result.stdout).toContain('Playing guitar!')
})

test('command help', async t => {
  let result = await execa('./tests/fixtures/musicCli.js', ['--help'])
  t.expect(result.stdout).toMatchSnapshot()

  result = await execa('./tests/fixtures/musicCli.js', ['start', '--help'])
  t.expect(result.stdout).toMatchSnapshot()

  const args = ['start', 'drum', '--help']
  result = await execa('./tests/fixtures/musicCli.js', args)
  t.expect(result.stdout).toMatchSnapshot()

  result = await execa('./tests/fixtures/musicCli.js', ['play', 'drum'])
  t.expect(result.stdout).toMatchSnapshot()
})
