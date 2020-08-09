const readline = require('readline')
const { print, chalk } = require('@ianwalter/print')
const sisteransi = require('sisteransi')

const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

module.exports = {
  async input (question, settings = {}) {
    const { prefix = '⌨️' } = settings

    // Print the question.
    print.write()
    print.log(prefix, chalk.bold.white(question))
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
    let { prefix = '⌨️', selected = options[0] } = settings

    let selectedIndex = options.indexOf(selected)

    // Print the question.
    print.write()
    print.log(prefix, chalk.bold.white(question))

    function renderOptions (overwrite = false) {
      if (overwrite) process.stdout.write(sisteransi.cursor.up(options.length))
      for (const option of options) {
        const prefix = option === selected ? '👉' : ''

        let label = typeof option === 'string' ? option : option.label
        if (option === selected) label = chalk.underline.yellow(label)

        print.log(prefix, label)
      }
    }

    renderOptions()

    // Create the readline instance.
    const rl = readline.createInterface(process.stdin)

    //
    readline.emitKeypressEvents(process.stdin, rl)

    //
    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    //
    return new Promise((resolve, reject) => {
      function close () {
        process.stdin.removeListener('keypress', keypressHandler)
        rl.close()
      }

      function keypressHandler (_, key) {
        if (key.name === 'return') {
          close()
          resolve(typeof selected === 'string' ? selected : selected.value)
        } else if (key.ctrl && key.name === 'c') {
          close()
          reject(new Error('SIGINT'))
        } else if (key.name === 'up') {
          if (selectedIndex) {
            selectedIndex--
            selected = options[selectedIndex]
            renderOptions(true)
          }
        } else if (key.name === 'down') {
          if (selectedIndex < options.length - 1) {
            selectedIndex++
            selected = options[selectedIndex]
            renderOptions(true)
          }
        }
      }
      process.stdin.on('keypress', keypressHandler)
    })
  },
  async multiselect (question, options, settings) {

  }
}
