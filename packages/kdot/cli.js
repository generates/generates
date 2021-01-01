import cli from '@generates/cli'
import { up, forward, unforward, down } from './index.js'
import consolidateConfig from './lib/consolidateConfig.js'

const { _: [command], ...input } = cli({
  name: 'kdot',
  description: 'A tool for managing services on Kubernetes',
  usage: 'kdot [command] [options]',
  // FIXME: get this to work.
  commands: {
    up: {},
    fwd: {
      aliases: ['forward']
    },
    unfwd: {
      aliases: ['unforward']
    },
    down: {}
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
      description: 'Whether to show a prompt before applying services',
      default: true
    }
  }
})

// Make sure the config has been consolidated into the a single set of values.
const cfg = await consolidateConfig(input)

if (command === 'up') {
  up(cfg)
} else if (command === 'fwd') {
  forward(cfg)
} else if (command === 'unfwd') {
  unforward(cfg)
} else if (command === 'down') {
  down(cfg)
}
