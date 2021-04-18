import { createLogger } from '@generates/logger'
import compose from 'koa-compose'

const logger = createLogger({ level: 'info', namespace: 'plug' })
const noOp = () => {}

export default async function plug (config = {}) {
  const phases = {}

  function register (phase, fn, index = phases[phase]?.items.length) {
    if (!config.phases?.includes(phase)) {
      throw new Error(`Unknown plugin phase: ${phase}`)
    }

    if (!fn.name) throw new Error('Plugin function must have a name')

    logger.debug('Registering plugin:', { phase, name: fn.name })

    if (phases[phase]) {
      //
      phases[phase].items.splice(index, 0, fn)

      //
      if (phases[phase].after && phases[phase].after[fn.name]) {
        phases[phase].items.push(...phases[phase].after[fn.name])
      }

      //
      phases[phase].entry = compose(phases[phase].items)
    } else {
      phases[phase] = { items: [fn], entry: compose([fn]) }
    }
  }

  const context = {
    ...config,
    logger,
    in (phase, fn) {
      register(phase, fn)
    },
    before (name, phase, fn) {
      const child = phases[phase]?.items?.findIndex(i => i.name === name)
      register(phase, fn, child !== undefined ? Math.max(child - 1, 0) : child)
    },
    after (name, phase, fn) {
      const parent = phases[phase]?.items?.findIndex(i => i.name === name)
      if (parent) {
        register(phase, fn, parent + 1)
      } else if (phases[phase]?.after) {
        if (phase[phase].after[name]) {
          phase[phase].after[name].push(fn)
        } else {
          phase[phase].after[name] = [fn]
        }
      } else if (phases[phase]) {
        phases[phase].after = { [name]: [fn] }
      } else {
        phases[phase] = { after: { [name]: [fn] } }
      }
    }
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
