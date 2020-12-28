import { readFileSync } from 'fs'
import { test } from '@ianwalter/bff'
import execa from 'execa'

test('cjs file not generated when --esm specified', async t => {
  const input = 'tests/fixtures/exportDefaultFunction.js'
  const esm = 'tmp/one.js'
  const args = [input, '--esm', esm]
  const { stdout } = await execa('./cli.js', args)
  t.expect(stdout).toMatchSnapshot()
  t.expect(readFileSync(esm, 'utf8')).toMatchSnapshot()
})

test('dist file is transpiled when --babel passed', async t => {
  const input = 'tests/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tmp/two.js'
  const args = [input, '--cjs', cjs, '--babel']
  const { stdout } = await execa('./cli.js', args)
  t.expect(stdout).toMatchSnapshot()
  t.expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})

test('dist file generated using custom plugins', async t => {
  const input = 'tests/fixtures/exportObjectWithVueComponent.js'
  const cjs = 'tmp/three.js'
  const plugins = ['--plugins', 'tests/helpers/vuePlugin.js']
  const args = [input, '--cjs', cjs, ...plugins]
  const { stdout } = await execa('./cli.js', args)
  t.expect(stdout).toMatchSnapshot()
  t.expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})
