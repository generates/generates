const { stripIndent } = require('common-tags')
const BaseError = require('@ianwalter/base-error')
const { createLogger, chalk, md } = require('../..')

class ExampleError extends BaseError {}

const logger = createLogger()

logger.write('No formatting on this one.')
logger.error('Environment variables not set!')
logger.error(new Error('No assertions were executed on that test.'))
logger.error(new ExampleError(chalk.bold('Expected something else.')))
logger.error('Timeout reached:', new ExampleError('promise cancelled'))
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

const err = new Error('No bueno!')
err.blame = 'You'
err.test = () => 'This should not be logged'
logger.error(err)

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
    result: err
  },
  fullName () {
    return `${this.details.firstName} ${this.details.lastName}`
  }
}
user.boss = user
logger.warn(new Error('User not found'), user)
logger.debug('Calling...', { phoneNumbers: user.details.address.phoneNumbers })
logger.md(stripIndent`
  A new version is available **v1.1.0**!
  * Run \`pnpm add widget@latest\` to upgrade
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
