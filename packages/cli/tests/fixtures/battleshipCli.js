const { createLogger } = require('@generates/logger')
const cli = require('../..')

const logger = createLogger()

const input = await cli({
  commands: {
    fire: {
      cannon: {
        options: {
          
        }
      },
      torpedo: {
        run (input) {
          return new Promise(resolve => setTimeout(
            () => {
              logger.log('Fired torpedo!')
              resolve()
            },
            500
          )})
        }
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
