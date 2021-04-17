export default function loggerPlugin (plug) {
  plug.in('plugin', function loggerPlugin (app, next) {
    app.logger = app.context.logger = console.log
    return next()
  })

  plug.after('error', 'middleware', async function logger (ctx, next) {
    ctx.logger.info('Start')
    await next()
    ctx.logger.info('End')
  })
}
