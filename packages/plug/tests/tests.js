import { test } from '@ianwalter/bff'
import plug from '../index.js'

const files = [
  new URL('fixtures/loggerPlugin.js', import.meta.url),
  new URL('fixtures/dbPlugin.js', import.meta.url),
  new URL('fixtures/mqPlugin.cjs', import.meta.url)
]

test('plug', async t => {
  const execute = await plug({ files })
  const app = { context: {} }
  await execute('plugin', app)
  t.expect(app.logger).toBeDefined()
  t.expect(app.db).toBeDefined()
  t.expect(app.mq).toBeDefined()
})
