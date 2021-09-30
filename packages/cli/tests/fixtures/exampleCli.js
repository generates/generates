#!/usr/bin/env node

import { createLogger } from '@generates/logger'
import cli from '../../index.js'

const logger = createLogger()

const input = cli({
  name: 'exampleCli',
  description: 'Just an example CLI',
  usage: 'example [options]',
  packageJson: true,
  options: {
    processorConcurrency: {
      aliases: ['c'],
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
      aliases: ['d'],
      description: 'Print debug statements',
      default: false
    }
  }
})

input.packageJson = { name: input.packageJson.name }

if (input.help) {
  process.stdout.write('\n')
  logger.plain(input.helpText)
  process.stdout.write('\n')
} else {
  logger.plain(input)
}
