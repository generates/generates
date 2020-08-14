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

function prettify (line) {
  let obj
  if (typeof line === 'string') {
    try {
      obj = JSON.parse(line)
    } catch (err) {
      // If the line couldn't be parsed as JSON, return it without formatting.
      return logger.write(line)
    }
  }

  let { message, error, level, type, ...rest } = obj

  //
  type = type || level || 'log'

  // If the ansi option is false, add the type back to the rest object so it's
  // included in the output.
  if (!config.ansi) rest.type = type

  let err
  if (error) {
    err = new Error(message)
    err.stack = error
  } else {
    //
    message = message || type.toUpperCase()
    if (type === 'log') message = chalk.bold(message)
  }

  const hasRest = Object.keys(rest).length
  logger[config.ansi ? type : 'plain'](err || message, ...hasRest ? [rest] : [])
}

function prettifier (lines) {
  for (const line of lines.split('\n')) prettify(line)
}

if (config.help) {
  logger.info(config.helpText)
} else {
  process.stdin.on('data', data => prettifier(data.toString()))
}
