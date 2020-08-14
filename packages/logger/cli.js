#!/usr/bin/env node

const cli = require('@generates/cli')
const { createLogger, chalk } = require('.')

const config = cli({
  name: 'logger',
  options: {
    ansi: { default: true }
  }
})

const logger = createLogger(config)

function hasType (type) {
  return logger.options.types.some(t => t.type === type)
}

function prettify (line) {
  // Parse the log line into a Object.
  let obj
  if (typeof line === 'string') {
    try {
      obj = JSON.parse(line)
    } catch (err) {
      // If the line couldn't be parsed as JSON, return it without formatting.
      return logger.write(line)
    }
  }

  let { namespace, message = '•', error, level, type, ...rest } = obj

  // Create a namespaced logger if a namespace is specified.
  const namespacedLogger = namespace ? logger.ns(namespace) : logger

  // Determine what the log type should be.
  type = type || level || 'log'

  if (!config.ansi || !hasType(type)) {
    rest.type = type
    type = config.ansi ? 'log' : 'plain'

    // Add the namespace back to the log object if not formatted.
    if (namespace && !namespacedLogger.unrestricted) rest.namespace = namespace
  }

  let err
  if (error) {
    // If the log message has an error attribute, try to "rehydrate" it so that
    // it's formatted like an error.
    err = new Error(message)
    err.stack = error
  }

  // If the log type is 'log', format the message so that it's bold like the
  // other types.
  if (type === 'log' && message) message = chalk.bold(message)

  // Output the formatted log line.
  rest = Object.keys(rest).length ? [rest] : []
  namespacedLogger[type](err || message, ...rest)
}

function prettifier (lines) {
  for (const line of lines.split('\n')) prettify(line)
}

if (config.help) {
  logger.info(config.helpText)
} else {
  process.stdin.on('data', data => prettifier(data.toString()))
}
