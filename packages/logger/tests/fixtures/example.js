const { stripIndent } = require('common-tags')
const BaseError = require('@ianwalter/base-error')
const { print, chalk, md } = require('../..')

class ExampleError extends BaseError {}

print.write('No formatting on this one.')
print.error('Environment variables not set!')
print.error(new Error('No assertions were executed on that test.'))
print.error(new ExampleError(chalk.bold('Expected something else.')))
print.error('Timeout reached:', new ExampleError('promise cancelled'))
print.warn('File was overwritten:', '\n', '/tmp/fakeFile.json')
print.info('Done in 0.91s.', '')
print.debug('Flaky test started.\n', stripIndent`
  Make sure you check it out.
  Could be trouble.
`)
print.log('Request made to server.')
print.log('🔑', chalk.cyan('$2b$12$HMJFAblrhBCGxTWv5BnIFe'))
print.log(`export default () => {
  console.log('Hello World!')
}
`)
print.log('⏱️', 'Timing you!')
print.success('You did it!', 'Great job.')
print.debug('Total tests run:', 1)

const err = new Error('No bueno!')
err.blame = 'You'
err.test = () => 'This should not be printed'
print.error(err)

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
print.warn(new Error('User not found'), user)
print.debug('Calling...', { phoneNumbers: user.details.address.phoneNumbers })
print.md(stripIndent`
  A new version is available **v1.1.0**!
  * Run \`pnpm add widget@latest\` to upgrade
  * Re-run widget
`)
print.success('Success!', md('**Donezo.**'))
print.fatal('This computer is dead.')
print.plain('No emojis, homies', { also: 'no ansi' })
const infoPrint = print.create({ level: 'info' })
infoPrint.ns('app.server').debug('Using random port')
const jsonPrint = infoPrint.create({ ndjson: true })
jsonPrint.info(
  'SWAPI Response',
  { statusCode: 200, body: 'Lando!' },
  { params: { q: 'one' } }
)
