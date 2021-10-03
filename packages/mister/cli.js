#!/usr/bin/env node

import cli from '@generates/cli'
import run from './index.js'

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

run(config)
