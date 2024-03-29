import { stripIndent } from 'common-tags'
import { createLogger, chalk, md } from '../../index.js'

class ExampleError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

const logger = createLogger()
const logErrors = process.argv.includes('-e')

logger.write('No formatting on this one.\n')
logger.error('Environment variables not set!')
if (logErrors) {
  logger.error(new Error('No assertions were executed on that test.'))
  logger.error(new ExampleError(chalk.bold('Expected something else.')))
  logger.error('Timeout reached:', new ExampleError('promise cancelled'))
}
logger.warn('File was overwritten:', '\n', '/tmp/fakeFile.json')
logger.info('Done in 0.91s.', '')
logger.debug('Flaky test started.\n', stripIndent`
  Make sure you check it out.
  Could be trouble.
`)
logger.log('Request made to server.')
logger.log('🔑', chalk.cyan('$2b$12$HMJFAblrhBCGxTWv5BnIFe'))
logger.log(`export default () => {
  console.log('Hello World!')
}
`)
logger.log('⏱️', 'Timing you!')
logger.success('You did it!', 'Great job.')
logger.debug('Total tests run:', 1)

let err
if (logErrors) {
  err = new Error('No bueno!')
  err.blame = 'You'
  err.test = () => 'I am a method'
  logger.error(err)
}

const user = {
  id: 321,
  enabled: true,
  email: 'jack@river.com',
  details: {
    firstName: 'Jack',
    lastName: 'River',
    registered: new Date('2019-06-21T00:13:54.246Z'),
    address: {
      address: '1 Test St',
      apt: '201a',
      city: 'Red Hook',
      state: 'VI',
      phoneNumbers: [
        '617-555-5555',
        '860-555-5555'
      ]
    },
    ...err && { result: err }
  },
  fullName () {
    return `${this.details.firstName} ${this.details.lastName}`
  }
}
user.boss = user
if (logErrors) logger.warn(new Error('User not found'), user)
logger.debug('Calling...', { phoneNumbers: user.details.address.phoneNumbers })
logger.md(stripIndent`
  A new version is available **v1.1.0**!
  * Run \`yarn add widget@latest\` to upgrade
  * Re-run widget
`)
logger.success('Success!', md('**Donezo.**'))
logger.fatal('This computer is dead.')
logger.plain('No emojis, homies', { also: 'no ansi' })
const info = logger.create({ level: 'info' }).ns('app.server')
info.debug('Using random port')
info.log('🆒', 'Cool man')
const json = info.create({ ndjson: true })
json.info(
  'SWAPI Response',
  { statusCode: 200, body: 'Lando!' },
  { params: { q: 'one' } }
)
logger.log('Array', user.details.address.phoneNumbers)
