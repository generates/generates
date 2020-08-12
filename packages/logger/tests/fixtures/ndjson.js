const { createPrint } = require('../..')

const print = createPrint({ ndjson: true })

print.info('Request to /')

console.log('Testing...')

print.warn('User not found', { userId: 123 })

console.log(JSON.stringify({ testing: 'No Message', response: { ok: true } }))
