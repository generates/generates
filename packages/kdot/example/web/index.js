import nrg from '@ianwalter/nrg'

const app = nrg.createApp({ log: { ndjson: false } })

app.get('/', ctx => {
  const { name, env } = ctx.cfg
  ctx.body = { name, env, msg: process.env.APP_MSG }
})

app.serve()
