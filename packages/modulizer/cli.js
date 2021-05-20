#!/usr/bin/env node

import cli from '@generates/cli'
import { createLogger } from '@generates/logger'
import modulize from './index.js'

const logger = createLogger({ level: 'info', namespace: 'modulizer.cli' })

const input = cli({
  name: 'modulizer',
  usage: 'modulize [options]',
  options: {
    name: {
      aliases: ['n']
    },
    output: {
      aliases: ['o']
    },
    cjs: {
      aliases: ['c']
    },
    esm: {
      aliases: ['e']
    },
    browser: {
      aliases: ['b']
    },
    inline: {
      aliases: ['i']
    },
    babel: {
      aliases: ['B']
    },
    plugins: {
      aliases: ['p']
    },
    minify: {
      aliases: ['m']
    },
    cwd: {
      default: process.cwd()
    },
    watch: {
      aliases: ['w']
    }
  }
})

if (input?.helpText) {
  process.stdout.write('\n')
  logger.info(input.helpText)
  process.stdout.write('\n')
  process.exit(0)
} else {
  modulize(input).catch(err => {
    logger.error(err)
    process.exit(1)
  })
}
