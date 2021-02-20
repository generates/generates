const util = require('util')
const readPkgUp = require('read-pkg-up')
const getopts = require('getopts')
const dotter = require('@generates/dotter')
const { merge } = require('@generates/merger')
const { oneLine } = require('common-tags')
const { md, chalk } = require('@generates/logger')
const decamelize = require('decamelize')
const camelcase = require('camelcase')

const args = process.argv.slice(2)
const delimiter = chalk.dim('–')

module.exports = function cli (config, input) {
  if (!input) {
    input = {}

    // Extract the curren't package's package.json so that it can be included in
    // the returned config object.
    const { packageJson } = readPkgUp.sync() || {}
    if (packageJson) merge(input, packageJson[config.name])

    //
    if (config.packageJson) input.packageJson = packageJson
  }

  // Convert cli config to getopts config.
  const opts = { alias: {}, default: {} }
  if (config.options) {
    for (let [key, option] of Object.entries(config.options)) {
      // Convert camelCased option names to kebab-case.
      option.flag = key = decamelize(key, '-')

      // Add option alias to getopts alias configuration.
      if (option.alias) opts.alias[key] = option.alias

      // Default to package.json config or option config.
      opts.default[key] = dotter.get(input, key) || option.default

      // Specify the option type.
      option.type = option.type || typeof opts.default[key]
      if (opts[option.type]) {
        opts[option.type].push(key)
      } else if (['string', 'boolean'].includes(option.type)) {
        opts[option.type] = [key]
      }
    }
  }

  // Collect any command-line arguments passed to the process.
  let cliOpts = getopts(args, opts)

  // Reduce any command-line arguments containing dots into a nested structure.
  cliOpts = Object.entries(cliOpts).reduce(
    (acc, [key, val]) => {
      // Convert keys back to camelCase.
      const flag = key
      key = key.split('.').map(k => camelcase(k)).join('.')

      if (key.includes('.')) {
        dotter.set(acc, key, val)
        delete acc[key]
      } else if (flag !== key) {
        acc[key] = val
        delete acc[flag]
      }
      return acc
    },
    cliOpts
  )

  // Add/overwrite configuration data with options passed through command-line
  // flags.
  merge(input, cliOpts)

  //
  if (!input.args) input.args = input._
  delete input._

  let command
  let commandConfig
  if (config.commands) {
    command = input.args.shift()
    commandConfig = config.commands[command]
  }

  if (command) {
    input.commands = input.commands || []
    input.commands.push(command)
    return cli(commandConfig, input)
  } else if (config.help || input.help) {
    // Generate help text from the given config.
    input.helpText = `# ${config.name}\n`

    if (config.description) input.helpText += `${config.description}\n\n`

    if (config.usage) input.helpText += `## Usage\n${config.usage}\n\n`

    if (config.commands) {
      input.helpText += '## Commands\n'
      input.helpText += Object.entries(config.commands).reduce(
        (acc, [key, command]) => {
          const info = command.description ? oneLine(command.description) : ''
          return acc + `* \`${key}\` ${delimiter} ${info}\n`
        },
        ''
      )
      input.helpText += '\n'
    }

    if (config.options) {
      input.helpText += '## Options\n'
      input.helpText += Object.values(config.options).reduce(
        (acc, option) => {
          const alias = option.alias ? `, -${option.alias}` : ''
          const info = option.description ? oneLine(option.description) : ''
          const def = option.default !== undefined
            ? `${info ? ' ' : ''}(default: \`${util.inspect(option.default)}\`)`
            : ''
          acc += `* \`--${option.type === 'boolean' ? '(no-)' : ''}`
          return acc + `${option.flag}${alias}\` ${delimiter} ${info}${def}\n`
        },
        ''
      )
    }

    // Format the help markdown text with marked.
    input.helpText = md(input.helpText) + '\n'
  } else if (config.execute) {
    return config.execute(input)
  }

  // Return the populated input object.
  return input
}
