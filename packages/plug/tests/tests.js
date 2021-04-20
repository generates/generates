import { test } from '@ianwalter/bff'
import plug from '../index.js'

const files = [
  new URL('fixtures/loggerPlugin.js', import.meta.url),
  new URL('fixtures/dbPlugin.js', import.meta.url),
  new URL('fixtures/mqPlugin.cjs', import.meta.url)
]

test('plugin files', async t => {
  const execute = await plug({ files, phases: ['plugin', 'middleware'] })
  const app = { context: {} }
  await execute('plugin', app)
  t.expect(app.logger).toBeDefined()
  t.expect(app.db).toBeDefined()
  t.expect(app.mq).toBeDefined()
})

test('plugin order', async t => {
  function testContextPlugin (plug) {
    plug.in('test', function testContext (ctx, next) {
      ctx.testContext = {}
      return next()
    })
  }
  function webdriverPlugin (plug) {
    plug.after('testContext', 'test', function webdriver (ctx, next) {
      ctx.testContext.browser = ctx.provisioned
      return next()
    })
  }
  function provisionerPlugin (plug) {
    plug.before('webdriver', 'test', function provisioner (ctx, next) {
      ctx.provisioned = true
      return next()
    })
  }
  const execute = await plug({
    phases: ['test'],
    plugins: [
      webdriverPlugin,
      testContextPlugin,
      provisionerPlugin
    ]
  })
  const ctx = {}
  await execute('test', ctx)
  t.expect(ctx.testContext).toBeDefined()
  t.expect(ctx.testContext.browser).toBe(true)
})
