const { createLogger } = require('../../cjs.cjs')

const logger = createLogger({ ndjson: true })

logger.info('Request to /')

console.log('Testing...')

const err = new Error('User not found')
err.userId = 123
err.timestamp = new Date()
logger.warn(err)

logger.ns('example.ndjson').success('Very nice!')

console.log(JSON.stringify({ type: 'single', no: 'message', res: { ok: 1 } }))

logger.error('Something went wrong at', new URL('https://ianwalter.dev'), null)
