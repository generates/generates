#!/usr/bin/env node

import path from 'path'
import cli from '@generates/cli'
import * as kdot from './index.js'
import consolidateConfig from './lib/consolidateConfig.js'

const { _: [command], ...input } = cli({
  name: 'kdot',
  description: 'A tool for managing apps on Kubernetes',
  usage: 'kdot [command] [options]',
  // FIXME: get this to work.
  commands: {
    up: {},
    fwd: {
      aliases: ['forward']
    },
    log: {
      aliases: ['logs']
    },
    del: {
      aliases: ['delete']
    }
  },
  options: {
    base: {
      alias: 'b',
      default: 'k.base.js'
    },
    custom: {
      alias: 'c',
      default: 'k.custom.js'
    },
    ext: {
      alias: 'e',
      description: 'Extend/override a config value using dot notation'
    },
    prompt: {
      alias: 'p',
      description: 'Whether to show a prompt before applying resources',
      default: true
    },
    failFast: {
      alias: 'f',
      description: 'Specifies whether to exit on the first failure',
      default: false
    }
  }
})

// Resolve the file paths for the base and custom configuration files relatives
// to the current working directory so they can be imported as modules.
input.base = path.resolve(input.base)
input.custom = path.resolve(input.custom)

// Make sure the config has been consolidated into the a single set of values.
const cfg = await consolidateConfig(input)

if (command === 'set') {
  kdot.set(cfg)
} else if (command === 'build') {
  kdot.build(cfg)
} else if (command === 'apply') {
  kdot.apply(cfg)
} else if (command === 'fwd') {
  kdot.fwd(cfg)
} else if (command === 'log') {
  kdot.log(cfg)
} else if (command === 'start') {
  kdot.start(cfg)
} else if (command === 'stop') {
  kdot.stop(cfg)
} else if (command === 'up') {
  kdot.up(cfg)
} else if (command === 'down') {
  kdot.down(cfg)
} else if (command === 'del') {
  kdot.del(cfg)
}
