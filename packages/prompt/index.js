const readline = require('readline')
const { createLogger, chalk } = require('@generates/logger')
const { cursor } = require('sisteransi')

const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

const logger = createLogger({ level: 'info', namespace: 'generates.prompt' })

function printLabel (prefix = '💬', label, fallback) {
  const hasFallback = fallback !== undefined
  logger.write()
  logger.log(prefix, chalk.bold.white(label))
  if (hasFallback) logger.log(chalk.bold('Default:'), chalk.dim(fallback))
}

function createReadline (keypressHandler, isText) {
  //
  if (isText) {
    process.stdout.write(cursor.show)
  } else {
    process.stdout.write(cursor.hide)
  }

  // Create the readline instance.
  const rl = readline.createInterface(process.stdin, isText && process.stdout)

  // Activate the keypress event listener on stdin.
  readline.emitKeypressEvents(process.stdin, rl)

  // Something the Node.js docs said I had to do.
  if (process.stdin.isTTY) process.stdin.setRawMode(true)

  // Add the keypress handler to stdin.
  process.stdin.on('keypress', keypressHandler)

  // Add a close method to the keypressHanlder so that it can remove itself and
  // close the readline instance.
  keypressHandler.close = function close () {
    process.stdin.removeListener('keypress', keypressHandler)
    rl.close()
  }

  return rl
}

function renderSelect (label, settings) {
  let { prefix, type, options, highlighted = 0, fallback } = settings
  const isMultiselect = type === 'multiselect'

  // Print the label.
  printLabel(prefix, label, fallback)

  // Convert options to objects if they are strings.
  options = options.map(o => typeof o === 'string' ? { label: o } : o)

  // Create a function to print options so that they can be re-printed when
  // the user uses the arrow keys to change the current selection.
  function render (options, highlighted) {
    for (const option of options) {
      const isHighlighted = option === highlighted && highlighted !== undefined
      const prefix = isHighlighted ? '👉' : option.selected ? '❎' : ''

      let label = isHighlighted ? chalk.underline(option.label) : option.label
      if (option.selected) {
        label = chalk.green(label)
      } else if (isHighlighted) {
        label = chalk.yellow(label)
      }

      logger.log(prefix, label)
    }
  }

  // Display the options.
  render(options, options[highlighted])

  return new Promise((resolve, reject) => {
    function rerender () {
      process.stdout.write(cursor.up(options.length))
      render(options, options[highlighted])
    }

    // Create a handler for the keypress event.
    createReadline(function keypressHandler (_, key) {
      if (key.name === 'return') {
        // Close the readline instance and return the currently selected
        // option.
        keypressHandler.close()

        let value = options[highlighted].value || options[highlighted].label
        if (isMultiselect) {
          // Collect all the selected option values into an array.
          value = options.filter(o => o.selected).map(o => o.value || o.label)
        } else {
          // Update the "highlighted" option to consider it selected.
          options[highlighted].selected = true
        }

        // Set highlighted to undefined and rerender the options so that it only
        // displays what was selected and not what was highlighted.
        highlighted = undefined
        rerender()

        // Return the selected value(s).
        resolve(value)
      } else if (key.ctrl && key.name === 'c') {
        // Reject the promise when the user hits CTRL+c so that the caller
        // can handle it.
        logger.ns('')
        keypressHandler.close()
        reject(new Error('SIGINT'))
      } else if (key.name === 'up') {
        // Select the previous option and reprint the options with the new
        // formatting.
        if (highlighted) {
          highlighted--
          rerender()
        }
      } else if (key.name === 'down') {
        if (highlighted < options.length - 1) {
          // Select the next option and reprint the options with the new
          // formatting.
          highlighted++
          rerender()
        }
      } else if (key.name === 'space' && isMultiselect) {
        options[highlighted].selected = !options[highlighted].selected
        rerender(options, options[highlighted])
      }
    })
  })
}

module.exports = {
  async text (label, settings = {}) {
    const { prefix, fallback } = settings

    // Print the label.
    printLabel(prefix, label, fallback)

    return new Promise((resolve, reject) => {
      function keypressHandler (_, key) {
        if (key.ctrl && key.name === 'c') {
          // Reject the promise when the user hits CTRL+c so that the caller
          // can handle it.
          keypressHandler.close()
          reject(new Error('SIGINT'))
        }
      }

      // Create the readline instance.
      const rl = createReadline(keypressHandler, true)

      // Ask the question.
      rl.question('    ', answer => {
        // Close the readline and remove the keypress listener now that the
        // question has been answered.
        keypressHandler.close()

        // Return the answer.
        resolve(answer || fallback)
      })
    })
  },
  async select (label, settings = { options: yesNoOptions }) {
    return renderSelect(label, settings)
  },
  async multiselect (label, settings = {}) {
    return renderSelect(label, { type: 'multiselect', ...settings })
  },
  async editor (label, settings = {}) {
    const { prefix, fallback } = settings

    // Print the label.
    printLabel(prefix, label, fallback)

    return new Promise((resolve, reject) => {
      try {
        const { edit } = require('external-editor')
        const answer = edit(settings.prefill) || fallback

        logger.log(answer)

        resolve(answer)
      } catch (err) {
        reject(err)
      }
    })
  }
}
