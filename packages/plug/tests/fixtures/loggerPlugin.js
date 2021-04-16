export default function loggerPlugin (plug) {
  plug.in('app', app => {
    app.logger = app.context.logger = console.log
  })

  plug.after('error', 'middleware', async function logger (ctx, next) {
    ctx.logger.info('Start')
    await next()
    ctx.logger.info('End')
  })
}
