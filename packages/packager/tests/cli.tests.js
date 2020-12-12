const { readFileSync } = require('fs')
const { test } = require('@ianwalter/bff')
const execa = require('execa')

test('cjs file not generated when --esm specified', async ({ expect }) => {
  const input = 'tests/fixtures/exportDefaultFunction.js'
  const esm = 'tmp/one.js'
  const args = [input, '--esm', esm]
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(esm, 'utf8')).toMatchSnapshot()
})

test('dist file is transpiled when --babel passed', async ({ expect }) => {
  const input = 'tests/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tmp/two.js'
  const args = [input, '--cjs', cjs, '--babel']
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})

test('dist file generated using custom plugins', async ({ expect }) => {
  const input = 'tests/fixtures/exportObjectWithVueComponent.js'
  const cjs = 'tmp/three.js'
  const plugins = ['--plugins', 'tests/helpers/vuePlugin.js']
  const args = [input, '--cjs', cjs, ...plugins]
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})
