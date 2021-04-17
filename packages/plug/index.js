import loadPluginFiles from './lib/loadPluginFiles.js'
import { createLogger } from '@generates/logger'

const logger = createLogger({ level: 'info', namespace: 'plug' })

export default async function plug (config = {}) {
  const phases = {}

  this.in = function registerPlugin (phase, fn) {
    if (config.phases?.includes(phase)) {
      throw new Error(`Uknown plugin phase: ${phase}`)
    }

    if (!fn.name) throw new Error('Plugin function must have a name')

    logger.debug('Registering plugin:', { phase, name: fn.name })

    if (phases[phase]) {
      phases[phase].push(fn)
    } else {
      phases[phase] = [fn]
    }
  }

  this.before = function registerBeforePlugin (plugin, name, fn) {}

  this.after = function registerAfterPlugin (plugin, name, fn) {

  }

  if (config.files) {
    // Load plugins from JS files.
    await loadPluginFiles(config.files)
  }

  this.run = function run (phase) {

  }
}
