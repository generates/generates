const util = require('util')
const readline = require('readline')
const chromafi = require('@ianwalter/chromafi')
const { match, get } = require('@generates/dotter')
const chalk = require('chalk')
const hasAnsi = require('has-ansi')
const hasEmoji = require('has-emoji')
const clone = require('@ianwalter/clone')
const marked = require('marked')
const TerminalRenderer = require('marked-terminal')
const stripAnsi = require('strip-ansi')
const { merge, isPlainObject } = require('@generates/merger')
const cloneable = require('@ianwalter/cloneable')

// Set up marked with the TerminalRenderer.
marked.setOptions({ renderer: new TerminalRenderer({ tab: 2 }) })

const atRe = /^\s+at\s(.*)/
const refRe = /^\s+at\s(.*)\s(\(.*\))$/
const toPaddedString = s => `    ${s}`
const toPaddedLine = line => line ? toPaddedString(line) : line
const toPaddedItems = (a, i) => a.concat(['\n', ...i ? [toPaddedLine(i)] : []])
const toMarkdownItems = i => md(i).split('\n').map(toPaddedString).join('\n')
const at = chalk.gray('at')
const byNotWhitespace = str => str && str.trim()
const isANewLine = msg => typeof msg === 'string' && msg === '\n'
const md = str => marked(str).trimEnd()
const clocks = ['🕛', '🕐', '🕒', '🕓', '🕕', '🕖', '🕘', '🕙']

function extractLogPrefix ({ items: [first, ...rest] }) {
  let prefix = ' '
  if (typeof first === 'string' && hasEmoji(first)) {
    const [actual, ...actualRest] = rest
    prefix = first
    first = actual
    rest = actualRest
  }
  return { prefix, items: [first, ...rest] }
}

function formatMarkdown (log) {
  log.items = log.items.map(toMarkdownItems)
}

function toStackLines (line) {
  if (line.match(refRe)) {
    return line.replace(refRe, `${at} ${chalk.bold('$1')} ${chalk.gray('$2')}`)
  } else if (line.match(atRe)) {
    return line.replace(atRe, `${at} ${chalk.gray('$1')}`)
  }
}

function getClone (src) {
  try {
    return clone(cloneable(src), { circulars: 0 })
  } catch (err) {
    return util.inspect(src)
  }
}

function createLogger (config = {}) {
  function addTypes (logger) {
    for (const type of logger.options.types) {
      logger[type.type] = function (...items) {
        this.name = type.type
        return this.out(type, items)
      }
    }
  }

  function toOutputString (addNewline) {
    return (acc = '', msg, idx, src) => {
      if (isPlainObject(msg)) return `${JSON.stringify(msg)}\n`
      const space = acc && !isANewLine(acc[acc.length - 1]) && !isANewLine(msg)
      const newline = addNewline && (idx === src.length - 1) ? '\n' : ''
      return acc + (msg ? (space ? ` ${msg}` : msg) : '') + newline
    }
  }

  function toNdjson (acc, msg, idx, src) {
    if (msg instanceof Error) {
      if (!acc.message) acc.message = msg.message
      acc.error = msg.stack
      acc.data = msg
    } else if (isPlainObject(msg)) {
      acc.data = merge(acc.data || {}, msg)
    } else if (typeof msg === 'string') {
      acc.message = toOutputString(true)(acc.message, msg, idx, src).trim()
    } else if (typeof msg?.toString === 'function') {
      acc.message = toOutputString(true)(acc.message, msg.toString(), idx, src)
        .trim()
    }
    // FIXME: Handle other types of data.
    return acc
  }

  function format (log) {
    const styled = get(chalk, log.style?.join('.'))

    log.items = log.items.reduce(
      (acc, item, index) => {
        const isFirst = index === 0
        const isString = typeof item === 'string'

        // Split the item by newlines so the first item and rest can be
        // formatted differently.
        let rest = []
        if (isString) {
          rest = item.split('\n')
          item = rest.shift()
        }

        if (item instanceof Error) {
          const { message, stack, ...err } = item

          // Format the error message with the given color and make it bold,
          // unless it's already formatted using ANSI escape sequences.
          item = styled(`${item.constructor.name}: `)
          item += hasAnsi(message) ? message : styled(message)

          // Format the error stacktrace.
          const stackLines = stack.split('\n').map(toStackLines)
          rest = rest.concat(stackLines.filter(byNotWhitespace))

          // Add the rest of the Error properties as a new item.
          if (Object.keys(err).length) {
            const items = chromafi(getClone(err), options.chromafi).split('\n')
            rest = rest.concat(items.slice(0, items.length - 1))
          }
        } else if (typeof item === 'object') {
          // If the item is an object, let chromafi format it.
          const items = chromafi(getClone(item), options.chromafi).split('\n')
          item = isFirst ? items.shift() : ''
          rest = rest.concat(items.slice(0, items.length - 1))
        } else {
          // If the item is not a string, turn it into one using util.inspect.
          if (!isString) item = util.inspect(item)

          // If the item is the first item logged and isn't already formatted
          // using ANSI escape sequences, format it with the log style.
          if (isFirst && !hasAnsi(item)) item = styled(item)
        }

        // Handle formatting an item that comes after a newline.
        if (isANewLine(acc[acc.length - 1])) item = toPaddedLine(item)

        // Add all the items back into the accumulator and return it.
        return acc.concat([item, ...rest.reduce(toPaddedItems, [])])
      },
      []
    )
  }

  function formatPlain (log) {
    format(log)
    log.items = log.items?.map(stripAnsi)
  }

  const defaults = {
    types: [
      // For debugging code through log statements.
      { type: 'debug', level: 'debug', prefix: '🐛', style: ['magenta'] },
      // For standard log statements.
      { type: 'info', level: 'info', prefix: '💁', style: ['cyan', 'bold'] },
      // For general log statements in which you can customize the emoji.
      { type: 'log', level: 'info', prefix: extractLogPrefix },
      // For log statements indicating a successful operation.
      { type: 'success', level: 'info', prefix: '✅', style: ['green', 'bold'] },
      // For the gray area between info and error.
      { type: 'warn', level: 'warn', prefix: '⚠️', style: ['yellow', 'bold'] },
      // For normal errors.
      { type: 'error', level: 'error', prefix: '🚫', style: ['red', 'bold'] },
      // For unrecoverable errors.
      { type: 'fatal', level: 'fatal', prefix: '💀', style: ['red', 'bold'] },
      // For log statements in Markdown format.
      { type: 'md', format: formatMarkdown },
      // For plain text without an emoji or ANSI escape sequences.
      { type: 'plain', prefix: ' ', format: formatPlain },
      // For writing to the log without any formatting at all.
      { type: 'write', format: false }
    ],
    // Write all logs to stdout by default. You can change io.err if you would
    // like to write errors to stderr, for example.
    io: {
      out: process.stdout.write.bind(process.stdout),
      err: process.stdout.write.bind(process.stdout)
    },
    level: 'debug',
    unrestricted: (process.env.DEBUG || '').split(','),
    chalkLevel: chalk.level || 2,
    ndjson: false,
    chromafi: { tabsToSpaces: 2, lineNumberPad: 0 },
    extraJson: [],
    extraItems: []
  }

  // Create the options Object by combinging defaults with the passed config.
  const options = merge({}, defaults, config)

  // Set the chalk level if configured.
  if (options.chalkLevel) chalk.level = options.chalkLevel

  // Determine the position of the type with the configured log level so that
  // logger can determine if future logs should be logged or not.
  const levelIndex = options.types.findIndex(t => t.type === options.level)

  const logger = {
    options,
    // Determine if log items should be logged because it's namespace matches a
    // value in the "unrestricted" list.
    get unrestricted () {
      return this.options.namespace && this.options.unrestricted.some(ns => {
        return match(ns.trim(), this.options.namespace)
      })
    },
    create (options) {
      return createLogger(options)
    },
    update (options) {
      // Clean up obsolete log types.
      for (const t of this.options.types) {
        if (options.types && options.types.indexOf(t) === -1) delete this[t]
      }

      // Merge the passed options with the existing options.
      merge(this.options, options)

      // Add the types to the logger instance now that the options are updated.
      addTypes(this)

      // Return the logger instance.
      return this
    },
    ns (namespace) {
      return this.create(merge({}, this.options, { namespace }))
    },
    out (type, items) {
      try {
        // Create the log object.
        const log = { ...type, items }

        // Determine if the log item should be logged based on level.
        log.shouldLog = !type.level || options.types.indexOf(type) >= levelIndex

        // Format and output the log if it has a high enough log level or has
        // been marked as unrestriected by the namespace functionality.
        if (log.shouldLog || this.unrestricted) {
          // If prefix is a function, get the prefix by calling the function
          // with the log items.
          if (typeof log.prefix === 'function') merge(log, log.prefix(log))

          // Determine how many spaces should pad the prefix to separate it from
          // the log item. This is tricky because of weird emoji lengths.
          const pad = (log.prefix?.length || 0) + [...log.prefix || []].length
          const spaceLength = log.prefix?.split(' ').length || 0
          log.prefix = log.prefix?.padEnd(pad + spaceLength - 1)

          // Format the log items.
          if (options.ndjson) {
            log.items = log.items.reduce(toNdjson, {})
          } else if (log.format === undefined) {
            format(log)
          } else if (log.format) {
            log.format(log)
          }

          // Create an array of output items.
          let output
          if (this.options.ndjson) {
            output = [{
              ...log.items,
              ...this.options.extraJson,
              message: log.items.message,
              level: log.level,
              type: log.type,
              namespace: this.options.namespace
            }]
          } else {
            const namespace = log.type === 'plain'
              ? this.options.namespace
              : chalk.blue.bold(this.options.namespace)
            output = [
              log.prefix,
              ...this.options.extraItems,
              this.unrestricted ? `${namespace} •` : '',
              ...log.items
            ]
          }
          const isNotWrite = log.type !== 'write'
          const outputString = output.reduce(toOutputString(isNotWrite), '')

          // Output the string using configured io.
          if (options.io) {
            return new Promise(resolve => options.io[log.io || 'out'](
              outputString,
              () => resolve(outputString)
            ))
          }

          // Return the output string to the caller.
          return outputString
        }
      } catch (err) {
        // Fallback to console.error if an error thrown when trying to output
        // the log.
        console.error(err)
      }
    }
  }

  // Add the log types to the logger object.
  addTypes(logger)

  logger.wait = function wait (...items) {
    const instance = {
      update: (...newItems) => (items = newItems),
      end: () => clearInterval(interval)
    }
    process.stdout.write('\n')

    let index = 1
    const interval = setInterval(
      () => {
        readline.moveCursor(process.stdout, 0, -1)
        readline.clearLine(process.stdout)
        logger.log(clocks[index % 8], ...items)
        index++
      },
      200
    )

    return instance
  }

  // Return the logger object for use.
  return logger
}

module.exports = { createLogger, chalk, md }
