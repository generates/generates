import path from 'path'
import { test } from '@ianwalter/bff'
import pack from '..'

const output = '/fakePath'

test('export default literal converted to module.exports', async ctx => {
  const name = 'exportDefaultLiteral'
  const input = path.join(__dirname, `fixtures/${name}.js`)
  const cjs = path.join(output, `${name}.js`)
  const options = { name, input, output, cjs, browser: true }
  ctx.expect(await pack(options)).toMatchSnapshot()
})

test('export default function converted to module.exports', async ctx => {
  const input = path.join(__dirname, 'fixtures/exportDefaultFunction.js')
  const cjs = path.join(output, 'some-function.js')
  ctx.expect(await pack({ input, output, cjs })).toMatchSnapshot()
})

test('export default new expression converted to module.exports', async ctx => {
  const input = path.join(__dirname, 'fixtures/exportDefaultNewExpression.js')
  ctx.expect(await pack({ input, output, cjs: true })).toMatchSnapshot()
})

test('all imports get bundled with module into pack files', async ctx => {
  const name = 'exportDefaultFunctionWithImports'
  const input = path.join(__dirname, `fixtures/${name}.js`)
  const cjs = path.join(output, `${name}.js`)
  const options = { name, input, output, cjs, esm: true, inline: '' }
  ctx.expect(await pack(options)).toMatchSnapshot()
})

test('specified import gets bundled with module into pack file', async ctx => {
  const input = path.join(__dirname, 'fixtures/exportObjectWithImports.js')
  const cjs = path.join(output, 'exportObjectWithImports.js')
  const inline = '@ianwalter/npm-short-name'
  const options = { input, output, cjs, inline, babel: true }
  ctx.expect(await pack(options)).toMatchSnapshot()
})

test.skip('hashbang is preserved', async ctx => {
  const input = path.join(__dirname, 'fixtures/cli.js')
  const cjs = path.join(output, 'cli.js')
  ctx.expect(await pack({ input, output, cjs })).toMatchSnapshot()
})
