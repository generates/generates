import { createLogger } from '@generates/logger'
import compose from 'koa-compose'

const logger = createLogger({ level: 'info', namespace: 'plug' })
const noOp = () => {}

export default async function plug (config = {}) {
  const phases = {}
  const context = {
    ...config,
    logger,
    in (phase, fn) {
      if (config.phases?.includes(phase)) {
        throw new Error(`Unknown plugin phase: ${phase}`)
      }

      if (!fn.name) throw new Error('Plugin function must have a name')

      logger.debug('Registering plugin:', { phase, name: fn.name })

      if (phases[phase]) {
        phases[phase].items.push(fn)
        phases[phase].entry = compose(phases[phase].items)
      } else {
        phases[phase] = { items: [fn], entry: compose([fn]) }
      }
    },
    before (plugin, name, fn) {},
    after (plugin, name, fn) {}
  }

  // Initialize the array of plugins with any plugins passed in config.
  let plugins = config.plugins || []

  // Load any plugins specified from JS files.
  if (config.files) {
    plugins = plugins.concat(await Promise.all(config.files.map(async file => {
      const plugin = await import(file)
      return plugin.default
    })))
  }

  // Allow plugins to register themselves.
  await Promise.all(plugins.map(plugin => plugin(context)))

  // Return a function to execute a phase.
  return function execute (phase, ctx, next = noOp) {
    if (phases[phase]) return phases[phase].entry(ctx, next)
  }
}
