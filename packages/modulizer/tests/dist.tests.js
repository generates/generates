import path from 'path'
import { test } from '@ianwalter/bff'
import modulize from '../index.js'

const output = '/fakePath'
const dirname = path.dirname(import.meta.url.replace('file://', ''))

test('export default literal converted to module.exports', async t => {
  const name = 'exportDefaultLiteral'
  const input = path.join(dirname, `fixtures/${name}.js`)
  const cjs = path.join(output, `${name}.js`)
  const options = { name, input, output, cjs, browser: true }
  t.expect(await modulize(options)).toMatchSnapshot()
})

test('export default function converted to module.exports', async t => {
  const input = path.join(dirname, 'fixtures/exportDefaultFunction.js')
  const cjs = path.join(output, 'some-function.js')
  t.expect(await modulize({ input, output, cjs })).toMatchSnapshot()
})

test('export default new expression converted to module.exports', async t => {
  const input = path.join(dirname, 'fixtures/exportDefaultNewExpression.js')
  t.expect(await modulize({ input, output, cjs: true })).toMatchSnapshot()
})

test('all imports get bundled with module into dist files', async t => {
  const name = 'exportDefaultFunctionWithImports'
  const input = path.join(dirname, `fixtures/${name}.js`)
  const cjs = path.join(output, `${name}.js`)
  const options = { name, input, output, cjs, esm: true, inline: '' }
  t.expect(await modulize(options)).toMatchSnapshot()
})

test('specified import gets bundled with module into dist file', async t => {
  const input = path.join(dirname, 'fixtures/exportObjectWithImports.js')
  const cjs = path.join(output, 'exportObjectWithImports.js')
  const inline = '@ianwalter/npm-short-name'
  const options = { input, output, cjs, inline, babel: true }
  t.expect(await modulize(options)).toMatchSnapshot()
})

test.skip('hashbang is preserved', async t => {
  const input = path.join(dirname, 'fixtures/cli.js')
  const cjs = path.join(output, 'cli.js')
  t.expect(await modulize({ input, output, cjs })).toMatchSnapshot()
})
