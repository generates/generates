const { test } = require('@ianwalter/bff')
const execa = require('execa')
const exampleCli = require('./fixtures/exampleCli')

test('cli', async ({ expect }) => {
  const { stdout } = await execa('./tests/fixtures/exampleCli.js', ['-c', '4'])
  expect(stdout).toMatchSnapshot()
})

test('dot format', async ({ expect }) => {
  const args = ['--some.other.thing', 'b']
  const { stdout } = await execa('./tests/fixtures/exampleCli.js', args)
  expect(stdout).toMatchSnapshot()
})

test('default', async ({ expect }) => {
  expect(exampleCli.path).toBe('/some/path')
})
