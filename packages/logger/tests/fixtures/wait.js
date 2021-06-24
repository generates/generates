const { createLogger } = require('../..')

const logger = createLogger()

const waitLogger = logger.wait('Initializing...')

setTimeout(() => waitLogger.update('Computing...'), 2000)

setTimeout(waitLogger.end, 9000)
