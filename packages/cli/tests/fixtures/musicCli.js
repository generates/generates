#!/usr/bin/env node

const { createLogger } = require('@generates/logger')
const cli = require('../..')

const logger = createLogger()

const input = cli({
  name: 'music',
  usage: 'music [commands] [args] [options]',
  description: 'Compose music from the command line!',
  commands: {
    start: {
      aliases: ['play'],
      usage: 'music start [instrument] [args]',
      description: 'Start playing instruments',
      commands: {
        drum: {
          usage: 'music start drum [tempo]',
          description: 'Start playing the drum at a certain tempo',
          run: input => {
            const [tempo] = input.args
            if (tempo) {
              logger.success(`Playing the drum at ${tempo}!`)
            } else {
              logger.error('No tempo specified')
            }
          }
        },
        guitar: {
          description: 'Start playing the guitar',
          run () {
            return new Promise(resolve => setTimeout(
              () => {
                logger.success('Playing guitar!')
                resolve()
              },
              500
            ))
          }
        }
      }
    },
    save: {
      name: 'Save. The. Music.',
      usage: 'music save [options]',
      description: 'Save the music to a file',
      options: {
        path: {
          aliases: ['p'],
          description: 'The path of the saved music file',
          default: './music.mp3'
        }
      },
      run: input => logger.success('Music saved to:', input.path)
    }
  },
  options: {
    style: {
      aliases: ['s'],
      description: 'The style of music to use as a base',
      default: 'pop'
    }
  }
})

if (input?.helpText) {
  process.stdout.write('\n')

  const [command] = input.args || []
  if (command) {
    logger.warn(`Command "${command}" not found`)
    process.stdout.write('\n')
  }

  logger.info(input.helpText)
  process.stdout.write('\n')
}
