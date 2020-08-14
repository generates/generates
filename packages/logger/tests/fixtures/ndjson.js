const { createLogger } = require('../..')

const logger = createLogger({ ndjson: true })

logger.info('Request to /')

console.log('Testing...')

const err = new Error('User not found')
err.userId = 123
logger.warn(err)

console.log(JSON.stringify({ testing: 'No Message', response: { ok: true } }))
