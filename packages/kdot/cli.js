#!/usr/bin/env node

import path from 'path'
import cli from '@generates/cli'
import * as kdot from './index.js'
import configure from './lib/configure.js'

const { _: [command, ...args], packageJson, ...input } = cli({
  name: 'kdot',
  description: 'A tool for managing apps on Kubernetes',
  usage: 'kdot [command] [apps] [options]',
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

//
input.args = args

// Use the "kdot" property in the project's package.json as the base
// configuration.
input.base = packageJson.kdot

// Resolve the file paths for the custom configuration files relative to the
// current working directory so they can be imported as modules.
if (input.custom) {
  input.custom = Array.isArray(input.custom)
    ? input.custom.map(f => path.resolve(f))
    : path.resolve(input.custom)
}

// Consolidate the configuration into a single set of values.
const cfg = await configure(input)

if (command === 'set') {
  kdot.set(cfg)
} else if (command === 'get') {
  kdot.get(cfg)
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
