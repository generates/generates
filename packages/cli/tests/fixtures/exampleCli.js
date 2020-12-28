#!/usr/bin/env node

const { createLogger } = require('@generates/logger')
const cli = require('../..')

const logger = createLogger()

const config = cli({
  name: 'exampleCli',
  description: 'Just an example CLI',
  usage: 'example [options]',
  options: {
    processorConcurrency: {
      alias: 'c',
      description: `
        The number of CPU cores to use when executing the application. The value
        must be an integer between 1 and 4
      `,
      default: 1
    },
    path: {
      default: '/some/path'
    },
    debug: {
      alias: 'd',
      description: 'Print debug statements',
      default: false
    }
  }
})

config.packageJson = { name: config.packageJson && config.packageJson.name }

if (require.main !== module) {
  module.exports = config
} else if (config.help) {
  logger.plain(config.helpText)
} else {
  logger.plain(config)
}
