const readline = require('readline')
const { print, chalk } = require('@ianwalter/print')
const { cursor } = require('sisteransi')

const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

function printQuestion (prefix = '⌨️', question) {
  print.write()
  print.log(prefix, chalk.bold.white(question))
}

function renderSelect (question, options, settings) {
  let { prefix, highlighted = 0, type } = settings
  const isMultiselect = type === 'multiselect'

  // Print the question.
  printQuestion(prefix, question)

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

      print.log(prefix, label)
    }
  }

  // Display the options.
  render(options, options[highlighted])

  // Create the readline instance.
  const rl = readline.createInterface(process.stdin)

  // Activate the keypress event listener on stdin.
  readline.emitKeypressEvents(process.stdin, rl)

  // Something the Node.js docs said I had to do.
  if (process.stdin.isTTY) process.stdin.setRawMode(true)

  return new Promise((resolve, reject) => {
    // Remove the keypress listener and close the readline instance.
    function close () {
      process.stdin.removeListener('keypress', keypressHandler)
      rl.close()
    }

    function rerender () {
      process.stdout.write(cursor.up(options.length))
      render(options, options[highlighted])
    }

    // Create a handler for the keypress event.
    function keypressHandler (_, key) {
      if (key.name === 'return') {
        // Close the readline instance and return the currently selected
        // option.
        close()

        let value = options[highlighted].value
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

        //
        resolve(value)
      } else if (key.ctrl && key.name === 'c') {
        // Reject the promise when the user hits CTRL+c so that the caller
        // can handle it.
        close()
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
    }

    // Add the keypress handler to stdin.
    process.stdin.on('keypress', keypressHandler)
  })
}

module.exports = {
  async input (question, settings = {}) {
    const { prefix } = settings

    // Print the question.
    printQuestion(prefix, question)
    process.stdout.write('    ')

    // Create the readline instance.
    const rl = readline.createInterface(process.stdin)

    // Execute the prompt and return the response.
    return new Promise(resolve => {
      rl.question('', answer => {
        rl.close()
        resolve(answer)
      })
    })
  },
  async select (question, options = yesNoOptions, settings = {}) {
    return renderSelect(question, options, settings)
  },
  async multiselect (question, options = [], settings = {}) {
    return renderSelect(question, options, { ...settings, type: 'multiselect' })
  }
}
