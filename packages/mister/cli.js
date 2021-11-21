#!/usr/bin/env node

import cli from '@generates/cli'
import { createLogger } from '@generates/logger'
import run from './index.js'

const logger = createLogger({ namespace: 'mister', level: 'info' })
const config = cli({
  name: 'mister',
  packageJson: true,
  options: {
    serial: {
      aliases: ['s'],
      description: 'Run scripts serially',
      default: true
    },
    path: {
      aliases: ['p'],
      description: 'Path to directory containing script'
    }
  }
})

run(config).catch(async err => {
  await logger.write('\n')
  await logger.error(err.message)
  await logger.write('\n')
  process.exit(err.exitCode || 1)
})
