#!/usr/bin/env node

const cli = require('@generates/cli')
const { createLogger } = require('.')

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

  let { message, ...rest } = obj
  const type = config.ansi ? (obj.type || obj.level || 'log') : 'plain'
  const hasRest = Object.keys(rest).length
  message = message || `${type[0].toUpperCase()}${type.substring(1)}`
  logger[type](...[message, ...hasRest ? [rest] : []])
}

function prettifier (lines) {
  for (const line of lines.split('\n')) prettify(line)
}

if (config.help) {
  logger.info(config.helpText)
} else {
  process.stdin.on('data', data => prettifier(data.toString()))
}
