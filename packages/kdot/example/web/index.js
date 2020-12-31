import nrg from '@ianwalter/nrg'

const app = nrg.createApp()

app.use(ctx => {
  ctx.body = { environment: app.env }
})
