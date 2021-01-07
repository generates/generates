import { promises as fs } from 'fs'
import path from 'path'
import { test } from '@ianwalter/bff'
import { update } from '../index.js'

const cwd = 'tests/tmp'

test('updating package.json', async t => {
  const release = { logLevel: 'debug', registries: ['foo', 'bar'] }
  await update({ release }, { cwd })
  const packagePath = path.resolve('tests/tmp/package.json')
  t.expect(await fs.readFile(packagePath, 'utf8')).toMatchSnapshot()
})

test('updating package.json with existing data', async t => {
  const $package = { bff: { logLevel: 'debug' }, num: 8 }
  const bff = { logLevel: 'info', plugins: ['config.js'] }
  await update({ bff }, { cwd, package: $package })
  const packagePath = path.resolve('tests/tmp/package.json')
  t.expect(await fs.readFile(packagePath, 'utf8')).toMatchSnapshot()
})
