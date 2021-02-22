const { createLogger } = require('@generates/logger')
const cli = require('../..')

const logger = createLogger()

const input = cli({
  commands: {
    fire: {
      cannon: {

      },
      torpedo: {

      }
    },
    dock: {
      options: {
        port: {
          aliases: ['p'],
          default: 'port'
        }
      },
      run: input => logger.info(`Docked at ${input.port}!`)
    }
  }
})

if (input.helpText) logger.info(input.helpText)
