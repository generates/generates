const { test } = require('@ianwalter/bff')
const execa = require('execa')
const exampleCli = require('./fixtures/exampleCli')

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
