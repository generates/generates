#!/usr/bin/env node

const { createLogger } = require('@generates/logger')
const cli = require('../..')

const logger = createLogger()

const input = cli({
  name: 'exampleCli',
  description: 'Just an example CLI',
  usage: 'example [options]',
  packageJson: true,
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

input.packageJson = { name: input.packageJson.name }

if (require.main !== module) {
  module.exports = input
} else if (input.help) {
  process.stdout.write('\n')
  logger.plain(input.helpText)
} else {
  logger.plain(input)
}
