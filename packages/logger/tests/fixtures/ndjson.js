const { createLogger } = require('../..')

const logger = createLogger({ ndjson: true })

logger.info('Request to /')

console.log('Testing...')

const err = new Error('User not found')
err.userId = 123
logger.warn(err)

logger.ns('example.ndjson').success('Very nice!')

console.log(JSON.stringify({ type: 'single', no: 'message', res: { ok: 1 } }))
